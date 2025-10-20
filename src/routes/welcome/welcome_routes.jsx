
// export default welcome_routes

import { lazy } from "react";
import { Route } from "react-router-dom";
const ForgetPasswordPage = lazy(() => import("../../pages/welcome/ForgetPasswordPage"));
const LoginPage = lazy(() => import("../../pages/welcome/LoginPage"));

export const welcome_routes_items = {
          login: {
                    path: "login",
                    name: "Connexion",
                    component: LoginPage
          },

          forgetpwd: {
            path: "reset_password",
            name: "Mot de passe oublié",
            component: ForgetPasswordPage
          },
          
}
var welcome_routes = []
for(let key in welcome_routes_items) {
          const route = welcome_routes_items[key]
          welcome_routes.push(<Route path={route.path} Component={route.component} key={route.path} />)
}

export default welcome_routes