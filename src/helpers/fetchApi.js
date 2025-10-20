

import wait from '../helpers/wait'
import store from '../store';
import { setToastAction } from '../store/actions/appActions';
import { unsetUserAction } from '../store/actions/userActions';
import removeUserDataAndCaches from '../utils/removeUserDataAndCaches';
export const API_URL = false
  ? "https://api.banguka.inoviatech.com"
  // ? "https://api.prototype.nodebu.inoviatech.com"
  : "http://169.254.94.169:5550"

const initialOptions = {
  method: 'GET',
  cacheData: false,
  checkInCacheFirst: false,
  timeout: 1 * 60 * 1000
}
/**
 * consomer une api avec les options par défaut
 * @param {string} url - le lien à appeler
 * @param {object} options - autres options comme les headers et le body
 * @returns { Promise }
 */
export default async function fetchApi(url, options = initialOptions) {
  options = {
    ...initialOptions,
    ...options
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
    store.dispatch(setToastAction({ severity: 'error', summary: 'La demande a expiré.', detail: 'Vérifiez votre connexion Internet et réessayez.', life: 3000 }));

  }, options.timeout)
  const cacheFirst = options.method == "GET" && options.checkInCacheFirst
  if (cacheFirst) {
    // const data = await cache.get(url)
    if (data) {
      return data
    }
  }
  const userF = localStorage.getItem("user");
  const locale = localStorage.getItem("locale");
  const user = JSON.parse(userF);
  // await wait(200)
  const { cacheData, checkInCacheFirst, ...otherOptions } = options
  var headers = {
    ...otherOptions.headers,
    // 'x-access-token': authorizationToken,
    'accept-language': locale || 'fr',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  if (user) {
    headers = {
      ...headers,
      authorization: `bearer ${user.token}`,
      'x-refresh-token': user.REFRESH_TOKEN
    };
  }
  var response, json
  response = await fetch(API_URL + url, {
    ...otherOptions,
    headers: { ...headers },
    signal: controller.signal
  });
  json = await response.json()
  if (response.status == 401) {
    if (json.authStatus == "INVALID_ACCESS_TOKEN") {
      if (user) {
        const accssesHeaders = {
          authorization: `bearer ${user.token}`,
          'x-refresh-token': user.REFRESH_TOKEN
        }
        const accessRes = await fetch(`${API_URL}/administration/auth/access_token`, {
          method: "POST",
          headers: accssesHeaders
        })
        const accessResult = await accessRes.json()
        if (accessRes.ok) {
          // retry the request with new access token
          const newAccessToken = accessResult.result
          localStorage.setItem("user", JSON.stringify({ ...user, token: newAccessToken }))
          response = await fetch(API_URL + url, {
            ...otherOptions,
            headers: { ...headers, authorization: `bearer ${newAccessToken}` }
          });
          json = await response.json()
        } else {
          // need to login again
          removeUserDataAndCaches(user.ID_UTILISATEUR, user.REFRESH_TOKEN)
          store.dispatch(unsetUserAction())
          store.dispatch(setToastAction({ severity: 'error', summary: 'Authentification is required', detail: 'Please login again to continue', life: 3000 }));
        }
      }
    }
  }

  clearTimeout(timeoutId)
  const canIcache = false
  if (response.ok) {
    const data = json
    if (canIcache) {
      // cache.store(url, data)
    }
    return data
  } else {
    if (response.status == 500) {
      // store.dispatch(setToastAction(TOAST_TYPES.SYSTEM_ERROR))
    }
    throw json
  }
}