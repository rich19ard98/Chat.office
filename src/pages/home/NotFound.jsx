// import { useEffect } from 'react'
// import '../../styles/app/notFound.scss'
// import { useSelector } from 'react-redux'
// import { userSelector } from '../../store/selectors/userSelector'
// import { Button } from 'primereact/button'
// import { useNavigate } from 'react-router'
// import { Link } from 'react-router-dom'

// export default function NotFound() {
//     useEffect(() => {
//         document.title = "NODEBU | page non trouvé"
//     }, [])
//     const user = useSelector(userSelector)
//     const navigate = useNavigate()
//     return (
//         <div className={`notfound-content d-flex flex-column align-items-center justify-content-center w-100 h-100 ${!user ? 'absolute' : ''}`}>
//             <div className="notfound-icon">
//                 <div className="notfound-icon-content">
//                     <div className="eyes">
//                         <div className="left"></div>
//                         <div className="right"></div>
//                     </div>
//                     <div className="mouth"></div>
//                 </div>
//             </div>
//             <div className="notfound-detail text-center">
//                 <h5>Hmm! <br /> Page non trouvée</h5>
//             </div>
//             {!user ? <div className="quick-links mt-2">
//                 <Link to={"/"} aria-label="Page d'acceuil" className="p-button p-component mr-2 p-button-sm p-button-info text-decoration-none">
//                     <span className="p-button-label p-c">Page d'acceuil</span>
//                 </Link>
//                 <Link to={"/login"} aria-label="Page d'acceuil" className="p-button p-component p-button-sm p-button-info text-decoration-none">
//                     <span className="p-button-label p-c">Se connecter</span>
//                 </Link>
//             </div> : null}
//         </div>
//     )
// }
import { useEffect } from 'react'
import '../../styles/app/notFound.scss'
import { useSelector } from 'react-redux'
import { userSelector } from '../../store/selectors/userSelector'
import { Link } from 'react-router-dom'

export default function Unauthorized() {
    useEffect(() => {
        document.title = "NODEBU | Accès non autorisé"
    }, [])

    const user = useSelector(userSelector)

    return (
        <div className={`notfound-content d-flex flex-column align-items-center justify-content-center w-100 h-100 ${!user ? 'absolute' : ''}`}>
            <div className="notfound-icon">
                <div className="notfound-icon-content">
                    <div className="eyes">
                        <div className="left"></div>
                        <div className="right"></div>
                    </div>
                    <div className="mouth"></div>
                </div>
            </div>
            <div className="notfound-detail text-center">
                <h5>🚫 Hmm! <br /> Vous n'êtes pas autorisé à visiter cette page</h5>
            </div>
            {!user && (
                <div className="quick-links mt-2">
                    <Link to={"/"} className="p-button p-component mr-2 p-button-sm p-button-info text-decoration-none">
                        <span className="p-button-label p-c">Page d'accueil</span>
                    </Link>
                    <Link to={"/login"} className="p-button p-component p-button-sm p-button-info text-decoration-none">
                        <span className="p-button-label p-c">Se connecter</span>
                    </Link>
                </div>
            )}
        </div>
    )
}
