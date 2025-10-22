import { Component, lazy } from "react";
import { Navigate, Route, useParams } from "react-router-dom";
import { encodeId } from "../../utils/IdEncryption";
const Statistique_Rapport_Financier = lazy(() => import("../../pages/Rapport_Financier/Statistique_Rapport_Financier"));

const Rapport_Finnancier = lazy(() => import("../../pages/Rapport_Financier/Rapport_Finnancier"));
const Liste_Activites_Pages = lazy(() => import("../../pages/Caisse_social/Liste_Activites_Pages"));
const Ajouter_activite_social = lazy(() => import("../../pages/Caisse_social/Ajouter_activite_social"));
const Achats_equipements_add = lazy(() => import("../../pages/cotisations/Achats_equipements_add"))
const Penalites_Retard_Listes = lazy(() => import("../../pages/Presence/Penalites_Retard_Listes"))
const Penalites_Retard_add = lazy(() => import("../../pages/Presence/Penalites_Retard_add"))
const Abscencesignaler_Listes = lazy(() => import("../../pages/Presence/Abscencesignaler_Listes"))
const Achats_equipements_listes = lazy(() => import("../../pages/cotisations/Achats_equipements_listes"))
const Penalites_Retard_edit = lazy(() => import("../../pages/Presence/Penalites_Retard_edit"))
const Compte_Resultant_liste_page = lazy(() => import("../../pages/plancomptable/Compte_Resultant_liste_page"));
const Journal_comptable_liste_page = lazy(() => import("../../pages/plancomptable/Journal_comptable_liste_page"));
const Balance_compte_liste_page = lazy(() => import("../../pages/plancomptable/Balance_compte_liste_page"));
const Livre_compte_liste_page = lazy(() => import("../../pages/plancomptable/Livre_compte_liste_page"));
const Parametre_liste_page = lazy(() => import("../../pages/parametres_financieres/Parametre_liste_page"));
const Parametres_edit_page = lazy(() => import("../../pages/parametres_financieres/Parametres_edit_page"));
const Comptescomptables_membres_liste_page = lazy(() => import("../../pages/plancomptable/Comptescomptables_membres_liste_page"));
const Remboursement_detail = lazy(() => import("../../pages/credits/Remboursement_detail"));
const Session_membre_liste_page = lazy(() => import("../../pages/session/Session_membre_liste_page"));
const Equipements_liste_page = lazy(() => import("../../pages/equipements/Equipements_liste_page"));
const Equipements_add_page = lazy(() => import("../../pages/equipements/Equipements_add_page"));
const Equipement_detail_page = lazy(() => import("../../pages/equipements/Equipement_detail_page"));
const InitialisationCompte_liste_page = lazy(() => import("../../pages/initialisationCompte/InitialisationCompte_liste_page"));
const InitialisationCompte_add_page = lazy(() => import("../../pages/initialisationCompte/InitialisationCompte_add_page"));
const Bilans_reel_page = lazy(() => import("../../pages/bilans/Bilans_reel_page"));
const Bilan_detail_page = lazy(() => import("../../pages/bilans/Bilan_detail_page"));
const Bilans_liste_page = lazy(() => import("../../pages/bilans/Bilans_liste_page"));
const Bilans_add_page = lazy(() => import("../../pages/bilans/Bilans_add_page"));
const Penalite_edit_page = lazy(() => import("../../pages/penalite/Penalite_edit_page"));
const Penalite_liste_page = lazy(() => import("../../pages/penalite/Penalite_liste_page"));
const Typescredit_edit_page = lazy(() => import("../../pages/typescredit/Typescredit_edit_page"));
const Menu_liste_page = lazy(() => import("../../pages/menu/Menu_liste_page"));
const Fournisseur_list_page = lazy(() => import("../../pages/fournisseur/Fournisseur_list_page"));
const Fournisseur_edit_page = lazy(() => import("../../pages/fournisseur/Fournisseur_edit_page"));
const Fournisseur_add_page = lazy(() => import("../../pages/fournisseur/Fournisseur_add_page"));
const Credit_approuve_Page = lazy(() => import("../../pages/credits/Credit_approuve_Page"));
const Comptescomptables_ajouter_page = lazy(() => import("../../pages/plancomptable/Comptescomptables_ajouter_page"));
const Typescredit_liste_page = lazy(() => import("../../pages/typescredit/Typescredit_liste_page"));
const Liste_lieu_autorise_page = lazy(() => import("../../pages/Presence/Liste_lieu_autorise_page"));
const Types_operations_comptables_add_page = lazy(() => import("../../pages/cotisations/Types_operation_comptables_add_page"));
const Remboursement_credit_add_page = lazy(() => import("../../pages/credits/Remboursement_credit_add_page"));
const Remboursement_credit_liste_page = lazy(() => import("../../pages/credits/Remboursement_credit_liste_page"));
const Frais_adhesions_liste_page = lazy(() => import("../../pages/frais_adhesions/Frais_adhesions_liste_page"));
const Frais_adhesion_add_page = lazy(() => import("../../pages/frais_adhesions/Frais_adhesion_add_page"));
const Amortissements_liste_page = lazy(() => import("../../pages/amortissements/Amortissements_liste_page"));
const Types_operations_comptables_edit_page = lazy(() => import("../../pages/cotisations/Types_operations_comptables_edit_page"));
const Cotisation_liste_page = lazy(() => import("../../pages/cotisations/Cotisation_liste_page"));
const Cotisation_add_page = lazy(() => import("../../pages/cotisations/Cotisation_add_page"));
const Credits_add_page = lazy(() => import("../../pages/credits/Credits_add_page"));
const Detail_Membres_pages = lazy(() => import("../../pages/cotisations/Detail_Membres_pages"))
const Statuts_credit_liste_page = lazy(() => import("../../pages/statuts_credit/Statuts_credit_liste_page"));
const Statuts_credit_edit_page = lazy(() => import("../../pages/statuts_credit/Statuts_credit_edit_page"));
const Types_operations_comptables_liste_page = lazy(() => import("../../pages/cotisations/Types_operations_comptables_liste_page"));
const Credits_liste_page = lazy(() => import("../../pages/credits/Credits_liste_page"));
const Comptabilite_liste_page = lazy(() => import("../../pages/comptabilites/Comptablite_liste_page"));
const Utilisateur_liste_page = lazy(() => import("../../pages/utilisateurs/Utilisateur_liste_page"));
const Utilisateur_add_page = lazy(() => import("../../pages/utilisateurs/Utilisateur_add_page"));
const Utilisateur_edit_page = lazy(() => import("../../pages/utilisateurs/Utilisateur_edit_page"));
const Profil_liste_page = lazy(() => import("../../pages/profil/Profil_liste_page"));
const Profil_add_page = lazy(() => import("../../pages/profil/Profil_add_page"));
const Profil_edit_page = lazy(() => import("../../pages/profil/Profil_edit_page"));
const Session_utilisateur_liste_page = lazy(() => import("../../pages/session/Session_utilisateur_liste_page"));
const modifyProfil_user = lazy(() => import("../../pages/utilisateurs/Modify_profiluserpage"));
const Changepwd = lazy(() => import("../../pages/utilisateurs/ChangepwdUserPage"));
const Membre_microfinance_list_page = lazy(() => import("../../pages/cotisations/Membre_microfinance_list_page"))
const Classecomptable_liste_page = lazy(() => import("../../pages/plancomptable/Classecomptable_liste_page"));
const Ajouter_membre_microfinance = lazy(() => import("../../pages/cotisations/Ajouter_membre_microfinance"))
const Comptescomptables_liste_page = lazy(() => import("../../pages/plancomptable/Comptescomptables_liste_page"));
const Edit_membre_microfinance = lazy(() => import("../../pages/cotisations/Edit_membre_microfinance"))
const Ecriturescomptables_liste_page = lazy(() => import("../../pages/plancomptable/Ecriturescomptables_liste_page"));
const Comptescomptables_edit_page = lazy(() => import("../../pages/plancomptable/Comptescomptables_edit_page"));
const Classecomptable_edit_page = lazy(() => import("../../pages/plancomptable/Classecomptable_edit_page"));
const Empoye_list_page = lazy(() => import("../../pages/employe/Empoye_list_page"))
const Employe_add_page = lazy(() => import("../../pages/employe/Employe_add_page"))
const Employe_edit_page = lazy(() => import("../../pages/employe/Employe_edit_page"))
const Types_de_fonction_list_page = lazy(() => import("../../pages/types_de_fonction/Types_de_fonction_list_page"))
const Types_de_fonction_add_page = lazy(() => import("../../pages/types_de_fonction/Types_de_fonction_add_page"))
const Types_de_fonction_edit_page = lazy(() => import("../../pages/types_de_fonction/Types_de_fonction_edit_page"))
const Listes_Transferts_listes = lazy(() => import("../../pages/Transferts/Listes_Transferts_listes"))
const Liste_planning_page = lazy(() => import("../../pages/Presence/Liste_planning_page"))
const Add_planning_page = lazy(() => import("../../pages/Presence/Add_planning_page"))
const Ajouter_Transfert_page = lazy(() => import("../../pages/Transferts/Ajouter_transfert_page"))
const Liste_notification_log_page = lazy(() => import("../../pages/Presence/Liste_notification_log_page"))
const Liste_presence_page = lazy(() => import("../../pages/Presence/Liste_presence_page"))
const Liste_Pointage_page = lazy(() => import("../../pages/Presence/Liste_Pointage_page"))
const Tableaudebord = lazy(() => import("../../pages/dashbaord/Tableaudebord"));
const NouveauResultat_pages = lazy(() => import("../../pages/Resultats/NouveauResultat_pages"));
const AffichageResultats = lazy(() => import("../../pages/Resultats/AffichageResultats"));
const ListesResultatsDetails = lazy(() => import("../../pages/Resultats/ListesResultatsDetails"));
const AjouterFrequenceCredits = lazy(() => import("../../pages/FrequenceCredits/AjouterFrequenceCredits"));
const ListeFrequencesCredits = lazy(() => import("../../pages/FrequenceCredits/ListeFrequencesCredits"));
const ModifierAgences = lazy(() => import("../../pages/Agences/ModifierAgences"));
const NouveauAgences = lazy(() => import("../../pages/Agences/NouveauAgences"));
const ListesAgences = lazy(() => import("../../pages/Agences/ListesAgences"));
const ModifierFrequenceCredits = lazy(() => import("../../pages/FrequenceCredits/ModifierFrequenceCredits"));

const Dividende_Membre_page = lazy(() => import("../../pages/cotisations/Dividende_Membre_page"));

const Compte_comptables_membres_listes = lazy(() => import("../../pages/Comptecomptablesmembres/Compte_comptables_membres_listes"));
const AjoutesCaisse = lazy(() => import("../../pages/Caisses/AjoutesCaisse"));
const AlimentationCaisses = lazy(() => import("../../pages/Caisses/AlimentationCaisses"));

const ListesCaisses = lazy(() => import("../../pages/Caisses/ListesCaisses"));

const ModifierCaisse = lazy(() => import("../../pages/Caisses/ModifierCaisse"));
const NouveauAlimentationCaisses = lazy(() => import("../../pages/Caisses/NouveauAlimentationCaisses"));

const ApprobationAlimentation = lazy(() => import("../../pages/Caisses/ApprobationAlimentation"));
const AjouterGroupementsFinancieres = lazy(() => import("../../pages/Groupemements/AjouterGroupementsFinancieres"));
const ListesGroupementsFinancieres = lazy(() => import("../../pages/Groupemements/ListesGroupementsFinancieres"));

const ModifierGroupementsFinanciere = lazy(() => import("../../pages/Groupemements/ModifierGroupementsFinanciere"));
const AjouterCaissier = lazy(() => import("../../pages/Caissier/AjouterCaissier"));
const ListesCaissiers = lazy(() => import("../../pages/Caissier/ListesCaissiers"));

const ModifierCaissier = lazy(() => import("../../pages/Caissier/ModifierCaissier"));


const Ajouter_Chef_Agences = lazy(() => import("../../pages/Agences/Ajouter_Chef_Agences"));
const Modifier_Chef_Agences = lazy(() => import("../../pages/Agences/ModifierAgences"));
const Listes_Chef_Agences = lazy(() => import("../../pages/Agences/Listes_Chef_Agences"));




const Ajouter_Penalite_Cotisation_retard = lazy(() => import("../../pages/parametres_financieres/Ajouter_Penalite_Cotisation_retard"));
const Penalite_Cotisation_retard_liste = lazy(() => import("../../pages/parametres_financieres/Penalite_Cotisation_retard_liste"));
const Penalite_Cotisation_retard_update = lazy(() => import("../../pages/parametres_financieres/Penalite_Cotisation_retard_update"));
const Create_nantissement = lazy(() => import("../../pages/credits/Create_nantissement"));
const Nantissement_listes_pages = lazy(() => import("../../pages/credits/Nantissement_listes_pages"));
const PageEcrireMessage = lazy(() => import("../../pages/messages/PageEcrireMessage"));

const Createaccount = lazy(() => import("../../pages/utilisateurs/Createaccount"));

export const administration_routes_items = {
  //messages
    PageEcrireMessage: {
    path: "messages/:id", // ✅ on ajoute le paramètre :id
    name: "Nouveau message",
    component: PageEcrireMessage,
  },
  //Nantissements
  Create_nantissement: {
    path: "Nantissements/add",
    name: "Nouveau ",
    component: Create_nantissement,
  },
  Nantissement_listes_pages: {
    path: "Nantissements",
    name: "Listes ",
    component: Nantissement_listes_pages,
  },
  //Penalites retard cotisation
  Ajouter_Penalite_Cotisation_retard: {
    path: "retard/add",
    name: "Nouveau ",
    component: Ajouter_Penalite_Cotisation_retard,
  },
  Penalite_Cotisation_retard_liste: {
    path: "retard",
    name: "Listes ",
    component: Penalite_Cotisation_retard_liste,
  },
  Penalite_Cotisation_update: {
    path: "retard/update/:ID_COTISATION_RETARD",
    name: "Update ",
    component: Penalite_Cotisation_retard_update,
  },
  //Chef Agences
  Ajouter_Chef_Agences: {
    path: "Cheaf/add",
    name: "Nouveau ",
    component: Ajouter_Chef_Agences,
  },
  Listes_Chef_Agences: {
    path: "Cheaf",
    name: "Listes ",
    component: Listes_Chef_Agences,
  },
  Modifier_Chef: {
    path: "Cheaf/Modifier/:ID_CHEF_AGENCE",
    name: "Modifier ",
    component: Modifier_Chef_Agences,
  },

  //Caissier
  AjouterCaissier: {
    path: "Caissier/add",
    name: "Nouveau ",
    component: AjouterCaissier,
  },
  ListesCaissiers: {
    path: "Caissier",
    name: "Listes ",
    component: ListesCaissiers,
  },
  ModifierCaissier: {
    path: "Caissier/updates/:ID_CAISSIER",
    name: "update ",
    component: ModifierCaissier,
  },
  //Groupements
  AjouterGroupementsFinancieres: {
    path: "groupements/add",
    name: "Nouveau ",
    component: AjouterGroupementsFinancieres,
  },
  ListesGroupementsFinancieres: {
    path: "groupements",
    name: "Liste ",
    component: ListesGroupementsFinancieres,
  },
  ModifierGroupementsFinanciere: {
    path: "groupements/update/:ID_GROUPEMENT",
    name: "Update ",
    component: ModifierGroupementsFinanciere,
  },
  //Caisse
  AjoutesCaisse: {
    path: "Caisses/add",
    name: "Nouveau ",
    component: AjoutesCaisse,
  },
  ListesCaisses: {
    path: "Caisses",
    name: "Listes ",
    component: ListesCaisses,
  },
  AlimentationCaisses: {
    path: "Alimentation",
    name: "Alimentation ",
    component: AlimentationCaisses,
  },
  AlimentationCaisse: {
    path: "Alimentation/:ID_ALIMENTATION",
    name: "Liste ",
    component: AlimentationCaisses,
  },
  ApprobationAlimentation: {
    path: "Alimentation/valide/:ID_ALIMENTATION",
    name: "Alimentation ",
    component: ApprobationAlimentation,
  },

  NouveauAlimentationCaisses: {
    path: "Alimentation/add",
    name: "Alimentation ",
    component: NouveauAlimentationCaisses,
  },
  ModifierCaisse: {
    path: "Caisses/update/:ID_CAISSE",
    name: "Update ",
    component: ModifierCaisse,
  },

  //Agences
  NouveauAgences: {
    path: "Agences/add",
    name: "Nouveau ",
    component: NouveauAgences,
  },
  ListesAgences: {
    path: "Agences",
    name: "Listes ",
    component: ListesAgences,
  },
  ModifierAgences: {
    path: "Agences/update/:ID_AGENCE",
    name: "Update ",
    component: ModifierAgences,
  },

  //Frequencecredits

  AjouterFrequenceCredits: {
    path: "FrequenceCredit/add",
    name: "Nouveau ",
    component: AjouterFrequenceCredits,
  },
  ListeFrequencesCredits: {
    path: "FrequenceCredit",
    name: "Listes ",
    component: ListeFrequencesCredits,
  },
  ModifierFrequenceCredits: {
    path: "FrequenceCredit/update/:ID_FREQUENCE_CREDIT",
    name: "Update ",
    component: ModifierFrequenceCredits,
  },
  //equipements
  equipement_bilan: {
    path: "equipements/details",
    name: "Modifier ",
    component: Equipement_detail_page,
  },
  Equipements: {
    path: "equipements",
    name: "Liste",
    component: Equipements_liste_page
  },
  EquipementsReference: {
    path: "equipements/:ID_EQUIP",
    name: "Liste",
    component: Equipements_liste_page
  },
  Equipements_add: {
    path: "equipements/add",
    name: "Nouvelle equipements",
    component: Equipements_add_page,
  },


  // initialisation des comptes
  initialisation: {
    path: "initialisation",
    name: "Liste",
    component: InitialisationCompte_liste_page,
  },
  initialisationReference: {
    path: "initialisation/:ID_INIT",
    name: "Liste Referencé",
    component: InitialisationCompte_liste_page,
  },
  initialisation_add: {
    path: "initialisation/add",
    name: "Nouvelle initialisation",
    component: InitialisationCompte_add_page,
  },
  // bilan ============
  journal: {
    path: "journal",
    name: "journal",
    component: Journal_comptable_liste_page,
  },
  bilan_add: {
    path: "bilan/add",
    name: "Nouveau",
    component: Bilans_add_page,

  },
  Resultas_add: {
    path: "Resultats",
    name: "Nouveau",
    component: NouveauResultat_pages,
  },
  Resultas: {
    path: "Listes",
    name: "Listes",
    component: AffichageResultats,
  },
  ResultasReference: {
    path: "Listes/:ID_RESULTAT",
    name: "Listes Reference",
    component: AffichageResultats,
  },
  ResultasDetail: {
    path: "Resultats/detail",
    name: "Details",
    component: ListesResultatsDetails,
  },


  liste_bilan: {
    path: "bilan",
    name: "bilan ",
    component: Bilans_reel_page,
  },
  liste_bilanReference: {
    path: "bilan/:ID_BILAN",
    name: "bilan reference ",
    component: Bilans_liste_page,
  },
  liste_all_bilan: {
    path: "bilan_liste",
    name: "bilan_liste",
    component: Bilans_liste_page,
  },
  details_bilan: {
    path: "bilan/details",
    name: "Modifier ",
    component: Bilan_detail_page,
  },
  Rapport_FinnancierReel: {
    path: "Rapport",
    name: "Rapport ",
    component: Rapport_Finnancier,
  },
  Statistique: {
    path: "Statistique",
    name: "Statistique ",
    component: Statistique_Rapport_Financier,
  },

  // parametres_financiers============
  parametres_financiers: {
    path: "parametres_financiers",
    name: "Liste",
    component: Parametre_liste_page,
  },

  edit_parametres_financiers: {
    path: "parametres_financiers/edit/:ID_PARAMETRE",
    name: "Modifier ",
    component: Parametres_edit_page,
  },

  // penalite============
  penalite: {
    path: "penalite",
    name: "Liste",
    component: Penalite_liste_page,
  },

  edit_penalite: {
    path: "penalite/edit/:ID_PENALITE",
    name: "Modifier ",
    component: Penalite_edit_page,
  },

  menu: {
    path: "menu",
    name: "menu",
    component: Menu_liste_page
  },


  dashbord: {
    path: "dashbord",
    name: "Tableau de bord",
    component: Tableaudebord,
  },

  Approuvecredits: {
    path: "credits/credits",
    name: "credit approuve",
    component: Credit_approuve_Page

  },
  Approuvecredit: {
    path: "credits/credits/:ID_OCTROI_CREDIT",
    name: "credit approuve",
    component: Credit_approuve_Page

  },
  // Route
  ReferenceCredit: {
    path: "credits/:ID_OCTROI_CREDIT",
    name: "REFERENCE",
    component: Credits_liste_page
  },


  types_credit: {
    path: "typescredit",
    name: "Liste",
    component: Typescredit_liste_page,
  },
  edit_types_credit: {
    path: "typescredit/edit/:ID_TYPES_CREDIT",
    name: "Modifier ",
    component: Typescredit_edit_page,
  },

  // ecritures comptables============
  ecriturescomptables: {
    path: "ecriturescomptables",
    name: "Ecritures comptables",
    component: Ecriturescomptables_liste_page,
  },
  Compteresultant: {
    path: "compteResult",
    name: "Compte de resultant",
    component: Compte_Resultant_liste_page,
  },
  //amortissements============
  amortissements: {
    path: "amortissements",
    name: "Liste",
    component: Amortissements_liste_page,
  },

  // statut credit============
  statutscredit: {
    path: "statutscredit",
    name: "Liste",
    component: Statuts_credit_liste_page,
  },

  edit_statutscredit: {
    path: "statutscredit/edit/:ID_STATUTS_CREDIT",
    name: "Modifier ",
    component: Statuts_credit_edit_page,
  },

  // comptes comptables membres=========
  comptescomptablesmembre: {
    path: "comptecomptablemembres",
    name: "Comptes comptables membres",
    component: Comptescomptables_membres_liste_page
  },

  // comptes comptables=========
  comptescomptables: {
    path: "comptecomptable",
    name: "Comptes comptables",
    component: Comptescomptables_liste_page,
  },
  edit_comptescomptables: {
    path: "comptecomptable/edit/:ID_COMPTES_COMPTABLES",
    name: "Modifier comptes comptables",
    component: Comptescomptables_edit_page,
  },
  comptescomptables_ajouter: {
    path: "comptecomptable/new",
    name: "ajouter comptes comptables",
    component: Comptescomptables_ajouter_page,
  },
  //frais d'adhesion=====================

  frais_adhReference: {
    path: 'frais_adh/:ID_FRAIS_ADHESIONS',
    name: 'Liste reference',
    component: Frais_adhesions_liste_page
  },
  frais_adh: {
    path: 'frais_adh',
    name: 'Liste',
    component: Frais_adhesions_liste_page
  },
  frais_adh_add: {
    path: 'frais_adh/new',
    name: 'Nouveau',
    component: Frais_adhesion_add_page
  },
  // Credits==================
  credits: {
    path: "credits",
    name: "credits",
    component: Credits_liste_page,
  },
  add_credits: {
    path: "credits/add",
    name: "Nouveau crédit",
    component: Credits_add_page,
  },


  // plan comptable
  classecomptable: {
    path: "classecomptable",
    name: "Classe comptable",
    component: Classecomptable_liste_page,
  },
  edit_classecomptable: {
    path: "classecomptable/edit/:ID_CLASSE_COMPTABLE",
    name: "Modifier classe comptable",
    component: Classecomptable_edit_page,
  },
  //========================

  charge_depenses: {
    path: "charge_depenses",
    name: "charge depenses",
    component: Comptabilite_liste_page
  },

  // type operation  =============

  types_operations_comptables: {
    path: "types_operations_comptables",
    name: "Opérations",
    component: Types_operations_comptables_liste_page
  },
  edit_types_operations_comptables: {
    path: "types_operations_comptables/edit/:ID_TYPES_OPERATIONS",
    name: "Modifier",
    component: Types_operations_comptables_edit_page
  },
  New_types_operations_comptables: {
    path: "types_operations_comptables/new",
    name: "Nouvelle operation ",
    component: Types_operations_comptables_add_page
  },
  //remboursement_credit============
  remboursement_credit: {
    path: "remboursement_credit",
    name: "Remboursement du credit",
    component: Remboursement_credit_liste_page
  },
  remboursement_creditReference: {
    path: "remboursement_credit/:ID_REMBOURSEMENT_CREDIT",
    name: "Remboursement du credit reference",
    component: Remboursement_credit_liste_page
  },
  add_remboursement_credit: {
    path: "remboursement_credit/add",
    name: "Nouveau remboursement",
    component: Remboursement_credit_add_page
  },

  livre_compte: {
    path: "livre_compte",
    name: "Grand livre des comptes",
    component: Livre_compte_liste_page

  },
  balance_compte: {
    path: "balance_compte",
    name: "Balances des comptes",
    component: Balance_compte_liste_page

  },
  DetailRemboursement: {
    path: "remboursement_credit/detail/:ID_REMBOURSEMENT_CREDIT",
    name: "Remboursement du credit detail",
    component: Remboursement_detail

  },
  // administration=========================
  Sessionutilisateurs: {
    path: "Sessionutilisateurs",
    name: "Sessions des utilisateurs",
    component: Session_utilisateur_liste_page,
  },

  Sessionmembres: {
    path: "Sessionmembres",
    name: "Sessions des membres",
    component: Session_membre_liste_page,
  },

  utilisateurs: {
    path: "utilisateurs",
    name: "Utilisateurs",
    component: Utilisateur_liste_page,
  },
  utilisateursReference: {
    path: "utilisateurs/:ID_UTILISATEUR",
    name: "Utilisateurs",
    component: Utilisateur_liste_page,
  },
  utilisateurs_page: {
    path: "utilisateurs/:ID_UTILISATEUR",
    name: "Liste",
    component: Utilisateur_liste_page,
  },

  new_utilisateurs: {
    path: "utilisateurs/new",
    name: "Nouveau ",
    component: Utilisateur_add_page,
  },
    Createaccount: {
    path: "Createaccount/new",
    name: "Nouveau ",
    component: Createaccount,
  },
  edit_utilisateurs: {
    path: "utilisateurs/edit/:ID_UTILISATEUR",
    name: "Modifier",
    component: Utilisateur_edit_page,
  },
  edit_utilisateur_old: {
    path: "utilisateurs/edit/:ID_UTILISATEUR",
    name: "Modifier",
    component: () => {
      const { ID_UTILISATEUR } = useParams()
      return <Navigate to={`/utilisateurs/edit/${encodeId(ID_UTILISATEUR)}`} />
    }
  },


  Changepwd: {
    path: "changepwd",
    name: "Changement Mot de passe",
    component: Changepwd,
  },
  modify_utilisateur: {
    path: "utilisateur/u/:ID_UTILISATEUR",
    name: "Modifier utilisateur",
    component: modifyProfil_user
  },
  modify_utilisateur_old: {
    path: "utilisateur/u/:ID_UTILISATEUR",
    name: "Modifier utilisateur",
    component: () => {
      const { ID_UTILISATEUR } = useParams()
      return <Navigate to={`/utilisateur/u/${encodeId(ID_UTILISATEUR)}`} />
    }
  },


  profil: {
    path: "profil",
    name: "Profil",
    component: Profil_liste_page,
  },
  add_profil: {
    path: "profil/add",
    name: "Nouveau profil",
    component: Profil_add_page,
  },
  edit_profil: {
    path: "profil/edit/:ID_PROFIL",
    name: "Editer le profil",
    component: Profil_edit_page,
  },

  //cotisation=============================
  Dividende: {
    path: "Dividende",
    name: "Dividende",
    component: Dividende_Membre_page,
  },
  DividendeReference: {
    path: "Dividende/:ID_DIVIDENDE",
    name: "Dividende",
    component: Dividende_Membre_page,
  },
  CaisseSocialadd: {
    path: "caisseSocialliste/new",
    name: "CaisseSocial",
    component: Ajouter_activite_social,
  },
  CaisseSocialListe: {
    path: "caisseSocialliste",
    name: "caisseSocialliste",
    component: Liste_Activites_Pages,
  },
  CaisseSocialListeReference: {
    path: "caisseSocialliste/:ID_ACTIVITE_CAISSE",
    name: "caisseSocialliste reference",
    component: Liste_Activites_Pages,
  },
  membre_microfinance: {
    path: "membre_microfinance",
    name: "Membres",
    component: Membre_microfinance_list_page,
  },
  New_membre_microfinance: {
    path: "membre_microfinance/new",
    name: "Nouveau ",
    component: Ajouter_membre_microfinance,
  },
  Edit_membre_microfinance: {
    path: "membre_microfinance/Edit/:ID_MEMBRES_MICROFINANCE",
    name: "Modifier ",
    component: Edit_membre_microfinance,
  },
  cotisation: {
    path: "cotisation",
    component: Cotisation_liste_page
  },
  cotisationReference: {
    path: "cotisation/:ID_COTISATIONS",
    name: "reference",
    component: Cotisation_liste_page
  },
  cotisation_add: {
    path: "cotisation/new",
    name: "Nouveau",
    component: Cotisation_add_page
  },

  MembreDetail: {
    path: "membre_microfinance/Details", // ← pas de paramètre dans le path
    name: "Détail Membre",
    component: Detail_Membres_pages
  },
  AchatsEquipements_add: {
    path: "achats_equipements/new",
    name: "achats_equipements_add",
    component: Achats_equipements_add
  },
  AchatsEquipements: {
    path: "achats_equipements",
    name: "achats_equipements_add",
    component: Achats_equipements_listes
  },
  AchatsEquipementsReference: {
    path: "achats_equipements/:ID_ACHAT_EQUIPEMENTS",
    name: "achats_equipements reference",
    component: Achats_equipements_listes
  },
  Compte_membres: {
    path: "Comptesmembres",
    name: "Comptesmembres",
    component: Compte_comptables_membres_listes,
  },


  employe: {
    path: "employe",
    name: "Employe",
    component: Empoye_list_page
  },
  employeReference: {
    path: "employe/:ID_EMPLOYE",
    name: "Employe",
    component: Empoye_list_page
  },
  new_employe: {
    path: "employe/new",
    name: "Nouveau Employe ",
    component: Employe_add_page
  },
  edit_employe: {
    path: "employe/edit/:ID_EMPLOYE",
    name: "Editer l' employe",
    component: Employe_edit_page
  },

  types_de_fonction: {
    path: "types_de_fonction",
    name: "types_de_fonction",
    component: Types_de_fonction_list_page
  },
  new_types_de_fonction: {
    path: "types_de_fonction/new",
    name: "Nouveau  fonction ",
    component: Types_de_fonction_add_page
  },
  edit_types_de_fonction: {
    path: "types_de_fonction/edit/:ID_TYPE_FONCTIONS",
    name: "Editer l'  fonction",
    component: Types_de_fonction_edit_page
  },
  ///////////////Presence
  Presences: {
    path: "Presences",
    name: "Presences",
    component: Liste_presence_page
  },
  Lieu_autorise: {
    path: "Lieu_Autorise",
    name: "Lieu autorise",
    component: Liste_lieu_autorise_page
  },
  Planning: {
    path: "Planning",
    name: "Planning",
    component: Liste_planning_page
  },
  Nouveau_Penalite_retard: {
    path: "Penalite_retard/new",
    name: "Nouveau ",
    component: Penalites_Retard_add
  },
  Penalite_retard: {
    path: "Penalite_retard",
    name: "Listes",
    component: Penalites_Retard_Listes
  },

  Demandeabs: {
    path: "Demandeabs",
    name: "Liste des abscences",
    component: Abscencesignaler_Listes
  },




  Penalite_retard_edit: {
    path: "Penalite_retard/edit/:ID_PENALITE_RETARD",
    name: "Update",
    component: Penalites_Retard_edit
  },

  Planning_new: {
    path: "Planning/add",
    name: "Planification du reunion",
    component: Add_planning_page
  },
  Notification: {
    path: "Notification",
    name: "Notification",
    component: Liste_notification_log_page
  },
  Pointages: {
    path: "Pointages",
    name: "Pointages",
    component: Liste_Pointage_page
  },
  Transferts: {
    path: "Transferts",
    name: "Transferts",
    component: Listes_Transferts_listes
  },
  TransfertsReference: {
    path: "Transferts/:ID_TRANSFERT_INTERNE",
    name: "Transferts",
    component: Listes_Transferts_listes
  },
  Transferts_add: {
    path: "Transferts/new",
    name: " Nouveau Transfert",
    component: Ajouter_Transfert_page
  },
  fournisseurs: {
    path: "fournisseur",
    name: "fournisseur",
    component: Fournisseur_list_page,

  },
  Fournisseur: {
    path: "fournisseur/:IDFOURNISSEUR",
    name: "fournisseur",
    component: Fournisseur_list_page,

  },
  fournisseur_add: {
    path: "fournisseur/new",
    name: " Nouveau fournisseur",
    component: Fournisseur_add_page
  },
  fournisseur_edit: {
    path: "fournisseur/edit/:IDFOURNISSEUR",
    name: "Editer le fournisseur",
    component: Fournisseur_edit_page
  },


};
var administration_routes = [];
for (let key in administration_routes_items) {
  const route = administration_routes_items[key];
  administration_routes.push(
    <Route path={route.path} Component={route.component} key={route.path} />
  );
}

export default administration_routes;
