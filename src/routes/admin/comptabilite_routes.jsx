import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { encodeId } from "../../utils/IdEncryption";

const Comptabilite_liste_page = lazy(() => import("../../pages/comptabilites/Comptablite_liste_page"));
const Types_charges_depenses_liste_page = lazy(() => import("../../pages/comptabilites/Types_charges_depenses_liste_page"));
const Types_charges_depenses_add_page = lazy(() => import("../../pages/comptabilites/Types_charges_depenses_add_page"));
const Types_charges_depenses_edit_page = lazy(() => import("../../pages/comptabilites/Types_charges_depenses_edit_page"))
const Fiche_depenses_liste_page = lazy(() => import("../../pages/fiche_depenses/Fiche_depenses_liste_page"))
const Fiche_depenses_add_page = lazy(() => import("../../pages/fiche_depenses/Fiche_depenses_add_page"))
const Categorie_depense_liste_page = lazy(() => import("../../pages/depenses/categorie_depense/Categorie_depense_liste_page"))
const Categorie_depense_add_page = lazy(() => import("../../pages/depenses/categorie_depense/Categorie_depense_add_page"))
const Categorie_depense_edit_page = lazy(() => import("../../pages/depenses/categorie_depense/Categorie_depense_edit_page"))
const Fiche_depense_Details_com_page = lazy(() => import("../../pages/fiche_depenses/Fiche_depense_Details_com_page"))
const Detail_Fiche_Depense_Liste_mp_page = lazy(() => import("../../pages/fiche_depenses/Detail_Fiche_Depense_Liste_mp_page"))
export const comptabilite_routes_items = {
  edit_type_charge_depenses: {
    path: "type_charge_depenses/edit/:ID_TYPES_CHARGES_DEPENSE",
    name: "Editer type_charge_depenses",
    component: Types_charges_depenses_edit_page,
  },
  new_type_charge_depenses: {
    path: "type_charge_depenses/new",
    name: "Nouveau type_charge_depenses",
    component: Types_charges_depenses_add_page,
  },
  charge_depenses: {
    path: "charge_depenses",
    name: "charge depenses",
    component: Comptabilite_liste_page,
  },
  type_charge_depenses: {
    path: "type_charge_depenses",
    name: "Types charge depenses",
    component: Types_charges_depenses_liste_page,
  },
  fiche_depenses: {
    path: "fiche_depenses",
    name: "fiche depenses",
    component: Fiche_depenses_liste_page
  }, fiche_depensesReference: {
    path: "fiche_depenses/:ID_FICHE_DEPENSES",
    name: "fiche depenses",
    component: Fiche_depenses_liste_page
  },

  new_fiche_depense: {
    path: "fiche_depenses/new",
    name: "Nouveau fichedepense",
    component: Fiche_depenses_add_page,
  }, categDep: {
    path: 'categDep',
    name: "Liste",
    component: Categorie_depense_liste_page
  },
  categDep_add: {
    path: 'categDep/new',
    name: 'Nouveau',
    component: Categorie_depense_add_page
  },
  categDep_edit: {
    path: 'categDep/edit/:ID_CATEGORIES_DEPENSES',
    name: "Mofifier",
    component: Categorie_depense_edit_page
  },

  detailDep: {
    path: 'detailDep',
    name: 'Liste detail',
    component: Detail_Fiche_Depense_Liste_mp_page,
  },


  fiche_depenses_detail_list: {
    path: "fiche_depenses/details/:ID_FICHE_DEPENSES",
    name: 'Detail dépense',
    component: Fiche_depense_Details_com_page

  },







};

var comptabilite_routes = [];
for (let key in comptabilite_routes_items) {
  const route = comptabilite_routes_items[key];
  comptabilite_routes.push(
    <Route path={route.path} element={<route.component />} key={route.path} />
  );
}

export default comptabilite_routes;