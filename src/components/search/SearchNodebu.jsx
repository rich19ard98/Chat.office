import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { userSelector } from "../../store/selectors/userSelector"
import IDS_ROLES from "../../constants/IDS_ROLES"

export default function SearchNodebu({ search, setShowSearch }) {
    const user = useSelector(userSelector)
    const adminPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.ADMINISTRATION)
    const adminAcces = adminPermission && (adminPermission.CAN_READ || adminPermission.CAN_WRITE)
    const administration = adminAcces ? [
        {
            title: "Utilisateurs",
            category: "Administration",
            subTitle: "Accéder à la liste des utilisateurs",
            url: "/utilisateurs"
        },
        {
            title: "Profils",
            subTitle: "Gérer les profils des utilisateurs",
            category: "Administration",
            url: "/profil"
        },


        {
            title: "Sessions des utilisateurs",
            subTitle: "Voir les sessions des utilisateurs",
            category: "Administration",
            url: "/Sessionutilisateurs"
        },

        {
            title: "Sessions des membres",
            subTitle: "Voir les sessions des des membres",
            category: "Administration",
            url: "/Sessionmembres"
        }
    ] : []

    const parametrePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PARAMETRE)
    const paramAcces = parametrePermission && (parametrePermission.CAN_READ || parametrePermission.CAN_WRITE)
    const parametre = paramAcces ? [
        {
            title: "Statut des credits",
            category: "Paramètre",
            subTitle: "Accéder à la liste des statuts",
            url: "/statutscredit"
        },
        {
            title: "Pénalité",
            subTitle: "Accéder à la liste des pénalite",
            category: "Paramètre",
            url: "/penalite"
        },

        {
            title: "Paramètre des financiers",
            subTitle: " Voir la liste des paramètre financiers",
            category: "Paramètre",
            url: "/parametres_financiers"
        }
    ] : []

    const rapportPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.RAPPORTS)
    const rapportAcces = rapportPermission && (rapportPermission.CAN_READ || rapportPermission.CAN_WRITE)
    const rapport = rapportAcces ? [
        {
            title: "Tableau de bord",
            category: "Rapport",
            subTitle: "Voir le tableau de bord",
            url: "/dashbord"
        },
        {
            title: "Grand livre des comptes",
            subTitle: "Accéder à la liste des grands livres comptes",
            category: "Rapport",
            url: "/livre_compte"
        },

        {
            title: "Balance des comptes",
            subTitle: "Voir la liste balance des comptes  ",
            category: "Rapport",
            url: "/balance_compte"
        },
        {
            title: "Journal des comptes",
            subTitle: "Voir la liste balance des comptes  ",
            category: "Rapport",
            url: "/journal"
        },
        {
            title: "comptes des resulants",
            subTitle: "Voir la liste balance des comptes  ",
            category: "Rapport",
            url: "/compteResult"
        }
    ] : []
    const fraisadhesionPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.FRAISADHESION)
    const fraisadhesionAcces = fraisadhesionPermission && (fraisadhesionPermission.CAN_READ || fraisadhesionPermission.CAN_WRITE)
    const fraisadhesion = fraisadhesionAcces ? [
        {
            title: "Frais d'adhésion",
            category: "Frais d'adhésion",
            subTitle: "Voir les frais d'adhésion",
            url: "/frais_adh"
        },

    ] : []
    const cotisationPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COTISATION)
    const cotisAcces = cotisationPermission && (cotisationPermission.CAN_READ || cotisationPermission.CAN_WRITE)
    const cotisation = cotisAcces ? [
        {
            title: "Membre du microfinance",
            category: "Cotisation",
            subTitle: "Accéder à la liste des membres",
            url: "/membre_microfinance"
        },
        {
            title: "Opérations",
            subTitle: "Voir la liste des opérations",
            category: "Cotisation",
            url: "/types_operations_comptables"
        },

        {
            title: "Cotisation",
            subTitle: "Voir la liste des cotisation",
            category: "Cotisation",
            url: "/cotisation"
        }, 
        {
            title: "Utilisation caisse social",
            subTitle: "Voir la liste des Activites",
            category: "Activites",
            url: "/caisseSocialliste"
        },
        {
            title: "Dividende",
            subTitle: "Voir la liste des Dividende",
            category: "Cotisation",
            url: "/dividende"
        }
    ] : []
    const creditPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.CREDIT)
    const creditAcces = creditPermission && (creditPermission.CAN_READ || creditPermission.CAN_WRITE)
    const credit = creditAcces ? [
        {
            title: "Credit ",
            category: "Credit",
            subTitle: "Accéder à la liste des credits",
            url: "/credits"
        },
        {
            title: "Remboursement des credits",
            subTitle: "Voir la liste des remboursements",
            category: "Credit",
            url: "/remboursement_credit"
        },
        {
            title: "Amortissement",
            subTitle: "Voir la liste des amortissements  ",
            category: "Credit",
            url: "/amortissements"
        },
        {
            title: "Type credits",
            subTitle: "Voir la liste des types credits",
            category: "Credit",
            url: "/typescredit"
        },
    ] : []
    const plancomptablePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PLANCOMPTABLE)
    const planAcces = plancomptablePermission && (plancomptablePermission.CAN_READ || plancomptablePermission.CAN_WRITE)
    const plan = planAcces ? [
        {
            title: "Classe comptable",
            category: "Plan comptable",
            subTitle: "Accéder à la liste des classe comptables",
            url: "/classecomptable"
        },
        {
            title: "Comptes comptables",
            subTitle: "Voir la liste des des comptes comptables",
            category: "Plan comptable",
            url: "/comptecomptable"
        },
        {
            title: "Ecritures comptables",
            subTitle: "Voir la liste des ecritures comptes",
            category: "Plan comptable",
            url: "/ecriturescomptables"
        },


        {
            title: "Initialisation des comptes",
            subTitle: "Voir la liste des paiements par semaine  ",
            category: "Plan comptable",
            url: "/initialisation"
        }
    ] : []

    const gerePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.GERER)
    const gereAcces = gerePermission && (gerePermission.CAN_READ || gerePermission.CAN_WRITE)
    const gerer = gereAcces ? [
        {
            title: "Employes",
            category: "Gerer",
            subTitle: "Accéder à la liste des employes",
            url: "/employe"
        },
        {
            title: "Fournisseurs",
            subTitle: "Voir la liste des fournisseurs",
            category: "Gerer",
            url: "/fournisseur"
        },
        {
            title: "Fonction",
            subTitle: "Voir la liste des fonctions",
            category: "Gerer",
            url: "/types_de_fonction"
        },

        {
            title: "Equipéments",
            subTitle: "Voir la liste des equipéments",
            category: "Gerer",
            url: "/equipements"
        }
    ] : []


    const comptabilitePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COMPTABILITES)
    const compAcces = comptabilitePermission && (comptabilitePermission.CAN_READ || comptabilitePermission.CAN_WRITE)
    const comptabilite = compAcces ? [
        {
            title: "charges dépenses",
            category: "Comptabilité",
            subTitle: "Accéder à la liste des charges dépenses",
            url: "/charge_depenses"
        },
        {
            title: "Types charges dépenses",
            subTitle: "Voir la liste des charges dépensess",
            category: "Comptabilité",
            url: "/type_charge_depenses"
        },
        {
            title: "Fiches dépenses",
            subTitle: "Voir la liste des fiches dépenses",
            category: "Comptabilité",
            url: "/fiche_depenses"
        },

        {
            title: "Détail dépense",
            subTitle: "Voir la liste des equipéments",
            category: "Comptabilité",
            url: "/detailDep"
        },
        {
            title: "Catégories dépenses",
            subTitle: "Voir la liste des equipéments",
            category: "Comptabilité",
            url: "/categDep"
        },
        {
            title: "Transferts",
            subTitle: "Voir la liste des transferts",
            category: "Comptabilité",
            url: "/Transferts"
        }
    ] : []
    const bilanPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.BILAN)
    const bilanAcces = bilanPermission && (bilanPermission.CAN_READ || bilanPermission.CAN_WRITE)
    const bilan = bilanAcces ? [
        {
            title: "Bilan",
            category: "Bilan",
            subTitle: "Accéder à la liste des bilans",
            url: "/bilan_liste"
        },
        {
            title: "Bilan en temps réel",
            subTitle: "Voir la liste des charges dépensess",
            category: "Bilan",
            url: "/bilan"
        },
    ] : []
    const presencePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PRESENCE)
    const preAcces = presencePermission && (presencePermission.CAN_READ || presencePermission.CAN_WRITE)
    const presence = preAcces ? [
        {
            title: "Présence",
            category: "Présence",
            subTitle: "Accéder à la liste des présence",
            url: "/Presences"
        },
        {
            title: "Planning",
            subTitle: "Voir la liste des planning",
            category: "Présence",
            url: "/Planning"
        },
        {
            title: "Pénalité retard",
            subTitle: "Voir la liste des penalites",
            category: "Présence",
            url: "/Penalite_retard"
        },
        {
            title: "Demandes des absences",
            subTitle: "Voir la liste des demandes des absences",
            category: "Demandes des absences",
            url: "/Demandeabs"
        },


    ] : []
    const ResultatsPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.RESULTAT)
    const ResAcces = ResultatsPermission && (ResultatsPermission.CAN_READ || ResultatsPermission.CAN_WRITE)
    const Resultats = ResAcces ? [
        {
            title: "Resultats",
            category: "Resultats",
            subTitle: "Accéder à la liste des Resultats",
            url: "/Resultats"
        },
        {
            title: "Resultats",
            category: "Resultats",
            subTitle: "Accéder à la liste des Resultats",
            url: "/Listes"
        },


    ] : []
    const links = [
        ...administration,
        ...parametre,
        ...rapport,
        ...fraisadhesion,
        ...cotisation,
        ...credit,
        ...plan,
        ...gerer,
        ...comptabilite,
        ...bilan,
        ...Resultats,
        ...presence
    ]
    const [filtered, setFiltered] = useState([])
    useEffect(() => {
        if (search.trim() != "") {
            const founded = links.filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase()))
            setFiltered(founded)
        }
    }, [search, links])
    const linksToshow = search.trim() != "" ? filtered : links
    return (
        <div className="links-container mt-2">
            {linksToshow.length > 0 ? linksToshow.map((link, index) => {
                const showGouper = (index == 0 || (index > 0 && linksToshow[index - 1].category.toLocaleLowerCase() != link.category.toLowerCase())) ? true : false
                return (
                    <div key={index}>
                        {showGouper ? <div className="search-link-grouper">{link.category}</div> : null}
                        <Link to={link.url} className="search-link d-flex align-items-center px-2 py-2 text-decoration-none rounded" onClick={() => {
                            setShowSearch(false)
                        }} autoFocus>
                            <span className="pi pi-hashtag icon" />
                            <div className="link-labels ml-3">
                                <div className="link_title">{link.title}</div>
                                <div className="link_subtitle">{link.subTitle}</div>
                            </div>
                        </Link>
                    </div>
                )
            }) : <div className="text-muted mt-3">Aucun résultat trouvé</div>}
        </div>
    )
}