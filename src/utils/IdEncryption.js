import { Base64 } from 'js-base64';

export const encodeId = id => {
          try {
                    if(id < 10) {
                              return `${Base64.encode(`${id}`, true)}_${Base64.encode(`${id}${[1, 2, 3, 4, 5].join(",")}`, true)}`
                    }
                    return Base64.encode(id, true)
          } catch (error) {
                    return null
          }
}


export const decodeId = encodedString => {
          try {
                    const splis = encodedString.split('_')
                    const str = splis[0]
                    if(str) {
                              return Base64.decode(str)
                    }
                    return Base64.decode(encodedString)
          } catch (error) {
                    return null
          }
}