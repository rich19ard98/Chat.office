import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../store/actions/appActions";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
// import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { userSelector } from "../../store/selectors/userSelector";
import administration_routes from "../../routes/admin/administration_routes";
import Signatureelectroniqueobr from "./signatureelectroniqueob";
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import entete from "../../../public/images/nodebu.png";
import moment from "moment";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
/**
* Récupérer toutes les classes comptables
* @date  15/04/2025
* @param {express.Request} req 
* @param {express.Response} res 
* @author rosine <gahimbarerosine9@gmail.com>
*/
export default function Balance_compte_liste_page() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [classecomptable, setClassecomptable] = useState([]);
  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [descriptionclasse, setdescriptionclasse] = useState(false);
  const [permissions, setPermissions] = useState(false);
  const [persmissiondata, setPersmissiondata] = useState(null);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [livre_compte, setLivre_compte] = useState([])
  const [comptecreditdata, setcomptecreditdata] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [globalLoading, setGlobalLoading] = useState(false);
  const [ecritures, setEcritures] = useState([]);
  // const [totalRecords, setTotalRecords] = useState(0);
  const [utilisateurdata, setutilisateurdata] = useState([]);
  const [membredata, setmembredata] = useState([]);
  const [comptedebitdata, setcomptedebitdata] = useState([]);
  // const [comptecreditdata, setcomptecreditdata] = useState([]);
  const [operationdata, setoperationdata] = useState([]);
  // const user = useSelector(userSelector);
  const [profiledata, setProfiledata] = useState([])
  // const [selectAll, setSelectAll] = useState(false);
  // const [selectedItems, setSelectedItems] = useState(null);
  const [selectedUtilisateur, setSelectedUtilisateur] = useState(null);
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [selectedcomptedebit, setSelectedcomptedebit] = useState(null);
  const [selectedcomptecredit, setSelectedcomptecredit] = useState(null);
  const [Selectedoperation, setSelecteoperation] = useState(null);
  const [montantTotal, setMontantTotal] = useState(0);
  const [montantTotalDebit, setMontantTotalDebit] = useState(0);
  const [montantTotalCredit, setMontantTotalCredit] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [pdfUrl, setPdfUrl] = useState(null);

  const user = useSelector(userSelector)
  // console.log(user);
  const navigate = useNavigate();

  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: "",
    filters: {
      name: { value: "", matchMode: "contains" },
      "country.name": { value: "", matchMode: "contains" },
      company: { value: "", matchMode: "contains" },
      "representative.name": { value: "", matchMode: "contains" },
    },
  });
  const [compte, setCompte] = useState(null);
  const statutSelected = async (statut) => {
    setCompte(statut);
  };

  const dispacth = useDispatch();
  const handleVisibility = (e) => {
    setIsVisible(!isVisible);
  };
  const onPage = (event) => {
    setlazyState(event);
  };

  const onSort = (event) => {
    setlazyState(event);
  };

  const onFilter = (event) => {
    event["first"] = 0;
    setlazyState(event);
  };

  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedItems(value);
    setSelectAll(value.length === totalRecords);
  };

  const onSelectAllChange = (event) => {
    const selectAll = event.checked;

    if (selectAll) {
      setSelectAll(true);
      setSelectedItems(classecomptable);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };

  const deleteItems = async (itemsIds) => {
    try {
      setGloabalLoading(true);
      const form = new FormData();
      form.append("ID_CLASSE_COMPTABLE", JSON.stringify(itemsIds));
      const res = await fetchApi("/plancomptable/classcomptable/detele_classecompable", {
        method: "post",
        body: form,
      });
      dispacth(
        setToastAction({
          severity: "success",
          summary: "classe comptable supprimé",
          detail: "La classe comptable a été supprimé avec succès",
          life: 3000,
        })
      );
      fetchClassecomptable();
      setSelectAll(false);
      setSelectedItems(null);
    } catch (error) {
      console.log(error);
      dispacth(
        setToastAction({
          severity: "error",
          summary: "Erreur du système",
          detail: "Erreur du système, réessayez plus tard",
          life: 3000,
        })
      );
    } finally {
      setGloabalLoading(false);
    }
  };
  const fetchcomptecredit = useCallback(async () => {
    try {
      var url = `/plancomptable/comptescomptables/fetch?rows=10000&`
      const res = await fetchApi(url);


      setcomptecreditdata(
        res.result.data.map((util) => {
          return {
            name: util.NOM,
            code: util.ID_COMPTES_COMPTABLES,
          };
        })
      );
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchcomptecredit();
  }, []);


  const fetchEcritures = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/plancomptable/ecriturecomptable/fetch?rows=10000000000&`;

      for (let key in lazyState) {
        const value = lazyState[key];
        if (value !== null && value !== undefined) {
          url += `${key}=${encodeURIComponent(typeof value === "object" ? JSON.stringify(value) : value)}&`;
        }
      }

      // if (dates) {
      //     const [startDate, endDate] = dates;
      //     if (startDate) {
      //         url += `startDate=${startDate.toISOString()}&`;
      //     }
      //     if (endDate) {
      //         url += `endDate=${endDate.toISOString()}&`;
      //     }
      // }


      // if (selectedUtilisateur?.code) {
      //     url += `utilisateurs=${selectedUtilisateur.code}&`;
      // }
      // if (selectedMembre?.code) {
      //     url += `membres_microfinance=${selectedMembre.code}&`;
      // }
      // if (Selectedoperation?.name) {
      //     url += `TYPE_OPERATION=${Selectedoperation.name}&`;
      // }
      // if (selectedcomptedebit) {
      //     url += `compte_debit=${selectedcomptedebit.code}&`;
      // }
      // if (selectedcomptecredit) {
      //     url += `compte_credit=${selectedcomptecredit.code}&`;
      // }

      const res = await fetchApi(url);
      const allEcritures = res.result.data;
      const totalMontant = allEcritures.reduce((total, item) => total + (parseFloat(item.MONTANT) || 0), 0);



      setTotalRecords(res.result.totalRecords);
      setMontantTotal(totalMontant);


    } catch (error) {
      console.error("Erreur lors du chargement des écritures comptables :", error);
    } finally {
      setLoading(false);
    }
  }, [
    lazyState,
    selectedUtilisateur,
    selectedMembre,
    Selectedoperation,
    selectedcomptecredit,
    selectedcomptedebit,
    startDate,
    endDate,
    // dates

  ]);
  useEffect(() => {
    fetchEcritures();
  }, [lazyState.first,
  lazyState.rows,
    selectedUtilisateur,
    selectedMembre,
    Selectedoperation,
    selectedcomptecredit,
    selectedcomptedebit,
    startDate,
    endDate,]);


useEffect(() => {
        document.title = "Liste des balance compte"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'balance_compte',
                name: 'Balances des comptes'
            },
        ]));

        return () => {
          dispacth(setBreadCrumbItemsAction([]));
      };
  }, []);
  const handleDeletePress = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { background: 'linear-gradient(rgba(226, 211, 239, 0.9), rgba(18 ,9 ,117, 0.30))', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Supprimer ?",
      message: (
        <div className="d-flex flex-column align-items-center">

          {inViewMenuItem ? (
            <>


              <div className="font-bold text-center my-2">
                {inViewMenuItem?.Nom}
              </div>
              <div className="text-center">
                Voulez-vous vraiment supprimer ?
              </div>
            </>
          ) : (
            <>
              <div className="text-muted">
                {selectedItems ? selectedItems.length : "0"} selectionné
                {selectedItems?.length > 1 && "s"}
              </div>
              <div className="text-center">
                Voulez-vous vraiment supprimer les éléments selectionnés ?
              </div>
            </>
          )}
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        deleteItems(itemsIds);
      },
    });
  };


  const fetchClassecomptable = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/plancomptable/ecriturecomptable/fetchbalance?rows=10000000000`;
      var url = baseurl;
      for (let key in lazyState) {
        const value = lazyState[key];
        if (value) {
          if (typeof value == "object") {
            url += `${key}=${JSON.stringify(value)}&`;
          } else {
            url += `${key}=${value}&`;
          }
        }
      }
      const res = await fetchApi(url);
      setEcritures(res.result)
      setTotalRecords(res.result.totalRecords);


    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);



  useEffect(() => {
    fetchClassecomptable();
  }, [lazyState]);

  // console.log(ecritures,"jjsjs")

  // useEffect(() => {
  //   document.title = "Classe comptable"
  //   dispacth(setBreadCrumbItemsAction([
  //     {
  //       path: 'classecomptable',
  //       name: 'Classe comptable'
  //     },
  //   ]));
  //   return () => {
  //     dispacth(setBreadCrumbItemsAction([]));
  //   };
  // }, []);
  const totalDebit = ecritures.filter(commde => commde) // Filtrer les recettes avec TYPE_BENEFE == 2
    .reduce((total, commde) => {
      if (commde && commde.montant_debit) {
        return total + parseFloat(commde.montant_debit); // Somme des MONTANT_A_PAYER
      }
      return total;



    }, 0);
  const totalCredit = ecritures.filter(commde => commde && commde) // Filtrer les recettes avec TYPE_BENEFE == 2
    .reduce((total, commde) => {
      if (commde && commde.montant_credit) {
        return total + parseFloat(commde.montant_debit); // Somme des MONTANT_A_PAYER
      }
      return total;
    }, 0);

  const exportPdf = () => {
    const pageWidth = 210;
    const pageHeight = 297;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: 'a4' });


    // Ajouter l'image importée
    doc.addImage(entete, "JPEG", 0, 2, 70, 30);

    // Titre sous l'image
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    const numeroVente = ecritures.ID_ECRITURES_COMPTABLES;
    doc.text(`Balance des comptes du le : ${moment(Date()).format("DD/MM/YYYY")}`, 100, 40, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const columns = [
      { title: "#", dataKey: "NUMERO" },
      { title: "Compte", dataKey: "nom_compte" },
      { title: "Débit", dataKey: "montant_debit" },
      { title: "Crédit", dataKey: "montant_credit" },
      { title: "Diffference", dataKey: "difference" },

    ];

    // Génération du tableau PDF avec fusion de cellules et centrage
    // const montatTotal = modes.MONTANT_TOTAL ? parseFloat(modes.MONTANT_TOTAL) : 0;

    doc.autoTable({
      startY: 45,
      head: [columns.map(col => col.title)],
      body: [
        ...ecritures.map((item, index) => [
          index + 1,

          item.nom_compte ? item.nom_compte : "-",
          item?.montant_debit ? `${parseFloat(item.montant_debit)} Fbu` : "-",
          item.montant_credit ? `${parseFloat(item.montant_credit).toLocaleString('fr-FR').replace(/\s/g, ' ')} Fbu` : "0 Fbu",
          // parseInt(item?.montant_debit - item.montant_credit)
          item.montant_credit || item?.montant_debit ? `${parseFloat(item?.montant_debit - item.montant_credit).toLocaleString('fr-FR').replace(/\s/g, ' ')} Fbu` : "0 Fbu",

        ]),
        // Ajouter les lignes pour les totaux
        // ["Total", "", `${montatTotal.toLocaleString('fr-FR').replace(/\s/g, ' ')} Fbu`,],
      ],
      margin: { top: 10, left: 5, right: 5 },
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [251, 140, 140], // Couleur de fond pour l'en-tête
      },
    });
    // Vérifier la position finale
    const finalY = doc.autoTable.previous.finalY || 0;

    // Définir la hauteur et la position du footer
    const footerYPosition = pageHeight - 20;

    // Ajouter une nouvelle page si le contenu dépasse la zone
    if (finalY + 20 > footerYPosition) {
      doc.addPage();
    }

    // Ajouter le footer sur la même ligne
    // const benef = ecritures.IS_BENEFICIAIRE == 1 ? (`${modes.empl.NOM} ${modes.empl.PRENOM}`) : (`${modes.fourn.NOM_COMPLET}`)

    // const effectuéPar = `Effectué par : ${ecritures.utilisateurs?.NOM} ${ecritures.utilisateurs?.PRENOM}`;
    // const approuvéPar = `Approuvé par : ${ecritures.validateur.NOM} ${ecritures.validateur.PRENOM}`;
    const effectuéPar = `Effectué par : ${user?.NOM} ${user?.PRENOM}`;
    // Positionnement du texte
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    // doc.text(`Bénéficiaire : ${benef}`, 10, footerYPosition - 30);
    doc.text(effectuéPar, 10, footerYPosition - 10);
    // doc.text(approuvéPar, 125, footerYPosition - 10,);

    // Ajouter l'image du pied de page
    // doc.addImage(piedFact, "JPEG", 0, footerYPosition + 5, pageWidth, 15);
  const totalY = doc.autoTable.previous.finalY + 10; // Positionner sous le tableau de charges
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Total Debit", 5, totalY);
    doc.text("Total Credit", 100, totalY);
    doc.text("Compte de résultat", 180, totalY, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${totalDebit}`, 5, totalY + 10);
    doc.text(`${totalCredit}`, 100, totalY + 10);
    doc.text(`${totalDebit - totalCredit} Fbu`, 180, totalY + 10, { align: "center" });


    return doc.output("blob");
  };
  const handleGenerateFacture = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();

    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Génerer fichier PDF",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment générer le PDF ?
          </div>
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        const blob = exportPdf();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      },
    });
  };
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT
const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT
          const plancomptablePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PLANCOMPTABLE)
          const planAcces = plancomptablePermission && (plancomptablePermission.CAN_READ || plancomptablePermission.CAN_WRITE)
          if (!planAcces && !IsGerant && !IsAdminAjoin) {
               return <NotFound/>
          }
  return (
    <>
      {/* <ConfirmDialog closable dismissableMask={true} /> */}
      {globalLoading && <Loading />}
      {pdfUrl ? (
        <>
          <div className="mt-4">
            <h1 className="mb-3">Dépense générée :</h1>
            <iframe
              src={pdfUrl}
              width="100%"
              height="800px"
              style={{ border: "1px solid #ccc" }}
              title="Facture PDF"
            />
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
            <Button
              className=" mt-3 ml-3 button-mobile "
              size="small"
              type="submit"
              onClick={() => {
                URL.revokeObjectURL(pdfUrl); // Libère l'ancien URL
                setPdfUrl(null);             // Cache l'iframe
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>
              <span className="ml-1" style={{ fontWeight: 'bold' }}>Fermer PDF</span>
            </Button>
          </div>
        </>

      ) : (
        <>
          <div className="px-4 py-3 main_content">
            <div className="d-flex align-items-center justify-content-between">
              <h1 className="mb-3">Balances des comptes</h1>

            </div>
            <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
              <div className="d-flex  align-items-center">
                <div className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    type="search"
                    placeholder="Recherche"
                    className="p-inputtext-sm"
                    style={{ minWidth: 300 }}
                    onInput={(e) =>
                      setlazyState((s) => ({ ...s, search: e.target.value }))
                    }
                  />
                </div>

                {/* <div className="p-input-icon-left ml-1">
              <Dropdown
                value={compte}
                onChange={(e) => statutSelected(e.value)}
                options={comptecreditdata}
                style={{ minWidth: 300 }}
                filter
                filterBy="name"
                optionLabel="name"
                placeholder="Compte"
                className="w-full md:w-10rem mx-3 no-p"
                showClear
              />
            </div> */}
              </div>

          {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
              <div className="selection-actions d-flex align-items-center ml-3">
                <Button
                  disabled={ecritures.length == 0}
                  className=" mt-3 ml-3 button-mobile "
                  size="small"
                  type="submit"
                  data-pr-tooltip="Genere le pdf" tooltip tooltipOptions={{ position: 'bottom' }}
                  onClick={(e) => {
                    handleGenerateFacture(e)

                  }}
                //  data-pr-tooltip="Générer le PDF"  // Ajout du tooltip
                // tooltipOptions={{ position: 'top' }} // Options pour la position du tooltip
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M17.924 7.154h-.514l.027-1.89a.46.46 0 0 0-.12-.298L12.901.134A.4.4 0 0 0 12.618 0h-9.24a.8.8 0 0 0-.787.784v6.37h-.515c-.285 0-.56.118-.76.328A1.14 1.14 0 0 0 1 8.275v5.83c0 .618.482 1.12 1.076 1.12h.515v3.99A.8.8 0 0 0 3.38 20h13.278c.415 0 .78-.352.78-.784v-3.99h.487c.594 0 1.076-.503 1.076-1.122v-5.83c0-.296-.113-.582-.315-.792a1.05 1.05 0 0 0-.76-.328M3.95 1.378h6.956v4.577a.4.4 0 0 0 .11.277a.37.37 0 0 0 .267.115h4.759v.807H3.95zm0 17.244v-3.397h12.092v3.397zM12.291 1.52l.385.434l2.58 2.853l.143.173h-2.637q-.3 0-.378-.1q-.08-.098-.093-.313zM3 14.232v-6h1.918q1.09 0 1.42.09q.51.135.853.588q.343.451.343 1.168q0 .552-.198.93q-.198.375-.503.59a1.7 1.7 0 0 1-.62.285q-.428.086-1.239.086h-.779v2.263zm1.195-4.985v1.703h.654q.707 0 .945-.094a.79.79 0 0 0 .508-.762a.78.78 0 0 0-.19-.54a.82.82 0 0 0-.48-.266q-.213-.04-.86-.04zm4.04-1.015h2.184q.739 0 1.127.115q.52.155.892.552q.371.398.565.972q.195.576.194 1.418q0 .741-.182 1.277q-.223.655-.634 1.06q-.31.308-.84.48q-.395.126-1.057.126H8.235zM9.43 9.247v3.974h.892q.501 0 .723-.057q.291-.074.482-.25q.193-.176.313-.579q.121-.403.121-1.099t-.12-1.068a1.4 1.4 0 0 0-.34-.581a1.13 1.13 0 0 0-.553-.283q-.25-.057-.98-.057zm4.513 4.985v-6H18v1.015h-2.862v1.42h2.47v1.015h-2.47v2.55z" /></svg>

                </Button>
              </div>
          :null}
            </div>
            <div className="content">
              <div className="shadow rounded mt-3 pr-1 bg-white">
                <DataTable
                  lazy
                  value={ecritures}
                  tableStyle={{ minWidth: "50rem" }}
                  className=""
                  paginator
                  size="small"
                   rowsPerPageOptions={[5, 10, 25, 50,100,200,500,1000,2000,5000]}
                   paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                   currentPageReportTemplate={` {first} - {last} dans ${totalRecords} éléments`}
                  emptyMessage="Aucun element trouvé"
                  // paginatorLeft={paginatorLeft}
                  // paginatorRight={paginatorRight}
                  first={lazyState.first}
                  rows={lazyState.rows}
                   totalRecords={totalRecords}
                  onPage={onPage}
                  onSort={onSort}
                  sortField={lazyState.sortField}
                  sortOrder={lazyState.sortOrder}
                  onFilter={onFilter}
                  filters={lazyState.filters}
                  loading={loading}
                  selection={selectedItems}
                  onSelectionChange={onSelectionChange}
                  selectAll={selectAll}
                  onSelectAllChange={onSelectAllChange}
                  reorderableColumns
                  resizableColumns
                  columnResizeMode="expand"
                  paginatorClassName="rounded"
                  scrollable
                // size="normal"
                >



                  <Column
                    field="Libelle"
                    frozen
                    header="Nom"
                    sortable
                    body={(item) => {
                      return (
                        <span>{item.nom_compte}</span>
                      );
                    }}
                  />

                  <Column
                    field="COMPTE_DEBIT"
                    header="Débit (BIF)"
                    sortable
                    body={(item) => {
                      return (
                        <span>{item.montant_debit ? `${parseFloat(item.montant_debit).toLocaleString('fr-FR')} Fbu` : '-'}</span>
                      );
                    }}
                  />
                  <Column
                    field="COMPTE_CREDIT"
                    header="Crédit (BIF))"
                    sortable
                    body={(item) => {
                      return (
                        <span>{item.montant_credit ? `${parseFloat(item.montant_credit).toLocaleString('fr-FR')} Fbu` : '-'}</span>
                      );
                    }}
                  />

                  <Column
                    field="Difference"
                    header="Différence (BIF)"
                    body={(item) => {
                      return (
                        <span>{`${parseFloat(item.montant_debit) - parseFloat(item.montant_credit)} Fbu`}</span>
                      );
                    }}
                  />

                </DataTable>
                <Dialog
                  headerStyle={{ backgroundColor: '#ecc5c5', backgroundSize: 'cover' }}
                  headerClassName="text-black"
                  header={`Description de la classe : ${descriptionText?.NOM_CLASSE || ''}`}

                  //header="Description"
                  visible={descriptionVisible}
                  style={{ width: '50vw' }}
                  onHide={() => setDescriptionVisible(false)}
                >
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: '1.5' }}>
                    {descriptionText?.DESCRIPTION || "Aucune description disponible."}
                  </div>
                </Dialog>


              </div>
            </div>
            <div className="content">
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="mb-3">Total de balance des comptes</h2>
              </div>
              <div className="shadow rounded mt-3 pr-1 bg-white">
                <DataTable
                  value={[totalDebit]} // Pas de données à afficher ici
                  tableStyle={{ minWidth: "50rem" }}
                  className="w-100"
                  showGridlines
                >
                  <Column field="TotalDebit" header="Total Débit" body={() => `${(totalDebit).toLocaleString('fr-FR')} Fbu`} />
                  <Column field="TotalCredit" header="Total Crédit" body={() => `${(totalCredit).toLocaleString('fr-FR')} Fbu`} />
                  <Column field="TotalSolde" header="Total Solde" body={() => `${(totalDebit - totalCredit).toLocaleString('fr-FR')} Fbu`} />
                </DataTable>
              </div>
            </div>
          </div>
          <Outlet />

        </>
      )}
    </>

  );
}
