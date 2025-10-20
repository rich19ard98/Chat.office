
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { InputMask } from "primereact/inputmask";
import { Tooltip } from 'primereact/tooltip';
import { Image } from "primereact/image";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import statutAmortissementsColor from "../../helpers/statutAmortissementsColor";
import { decodeId, encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import { userSelector } from "../../store/selectors/userSelector";
import STATUTS_CREDIT from "../../constants/ID_STATUTS_CREDIT";
import PROFILS from "../../constants/PROFILS";


const initialForm = {


};
export default function Remboursement_detail() {
  const dispacth = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const idrls = decodeId(id)
  const { ID_REMBOURSEMENT_CREDIT: encodedStr } = useParams();
  const ID_REMBOURSEMENT_CREDIT = decodeId(encodedStr)
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const user = useSelector(userSelector)
  const [selectAccessoire_stock, setSelectAccessoire_stock] = useState([]);
  const [selectAccessoire_stockEdit, setSelectAccessoire_stockEdit] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [amortissements, setAmortissements] = useState([]);
  const [totalRecords, setTotalRecords] = useState(1);
  const [total, setTotal] = useState(0);
  const [modes, setModes] = useState([])
  const [iconVisibledate, setIconVisibledate] = useState(true);
  const [iconVisibleFactureProf, setIconVisibleFactureProf] = useState(true);
  const [loading, setLoading] = useState(true);
  const [ldetails, setLdetails] = useState([])
  const [visible, setVisible] = useState(false);
  const [codes, setCodes] = useState(null);
  const [montantrestant, setmontantrestant] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [visibleRejet, setVisibleRejet] = useState(true);
  const [creditId, setcreditId] = useState(true);
  const [iconVisible, setIconVisible] = useState(true);
  const [dropdownVisibleFourni, setDropdownVisibleFourni] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPrixUnitaire, setSelectedPrixUnitaire] = useState(null);
  const [selectedQuantite, setSelectedQuantite] = useState(null);
  const [selectedPrixVenteUnitaire, setSelectedPrixVenteUnitaire] = useState(null);
  const [MontantCompteInterne, setMontantCompteInterne] = useState(null);
  const [MontantDemande, setMontantDemande] = useState(null);
  const [typesoperation, setTypeOperation] = useState([]);


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
  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError, } = useFormErrorsHandle({ ...data, selectedProduct },
    {


    }
  );

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();

        const res = await fetchApi(`/produit/commande/InsertMedicdetailsComm`, {
          method: "POST",
          body: form,
        });
        dispacth(
          setToastAction({
            severity: "success",
            summary: "Accessoire ajoutée",
            detail: "L' accessoire a bien été  ajoutée dans une commande ",
            life: 3000,
          })
        );
        FindListeDetailsrequis()
        FindOneRequis()
        fetchAccessoires()


        setSelectedPrixUnitaire("");
        setSelectedProduct(null);
        setSelectedQuantite("");
        setSelectedPrixVenteUnitaire("");
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    document.title = "Détail remboursement crédit";
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'remboursement_credit',
        name: 'Remboursement credit'
      },
      {
        path: 'detail',
        name: 'Détail remboursement crédit'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);



  const FindListeDetailsRemboursement = useCallback(async () => {
    try {
      setLoading(true);
      let baseurl;
      if (id) {
        baseurl = await fetchApi(`/credits/Remboursement_credit/detailRemboursement/${idrls}`);
      } else {
        baseurl = await fetchApi(`/credits/Remboursement_credit/detailRemboursement/${ID_REMBOURSEMENT_CREDIT}`);
      }
      var url = baseurl;
      const res = url

      setLdetails(res.result);
      setSelectedItems(res.result);
      setSelectAll(true)
      // setInViewMenuItem(res.result)


    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    FindListeDetailsRemboursement()

  }, [])


  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setVisibleRejet(!visibleRejet);
  };

  const toggleDropdownFourni = () => {
    setDropdownVisibleFourni(!dropdownVisibleFourni);
    setIconVisible(false);
  };
  const annuler = () => {
    setDropdownVisibleFourni(false);
    setIconVisible(true);
  };




  // Liste déroulante des membres
  const fetchMembre = useCallback(async () => {
    try {
      const res = await fetchApi("/cotisation/membres_microfinance/fetch?rows=1000000&");
      const membres = res.result.data.map((catg) => ({
        name: catg.NOM,
        code: catg.MEMBRE_ID,
      }));
      setFournisseurs(membres);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchMembre();
  }, []);



  const Approuvecredit = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();

    const montantTotalCompteInterne = parseFloat(MontantCompteInterne);
    const montantDemande = parseFloat(MontantDemande); // Assure-toi que c'est un nombre

    // console.log("Montant Total Compte Interne:", montantTotalCompteInterne);
    // console.log("Montant Demande:", montantDemande);

    if (montantTotalCompteInterne < montantDemande) {
      dispacth(
        setToastAction({
          severity: "warn",
          summary: "Montant insuffisant",
          detail: "Le compte interne ne couvre pas le montant demandé.",
          life: 3000,
        })
      );
      return; // 👈 Empêche la suite si le montant est insuffisant
    }

    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Terminer l'approbation",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment approuver le crédit ?
          </div>
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        ApprouvecreditItems(itemsIds);
      },
    });
  };


  const ApprouvecreditItems = async (id) => {
    try {
      const res = await fetchApi(`/credits/credits/approuveCredit/${id}`, {
        method: "get",
      });


      dispacth(
        setToastAction({
          severity: "success",
          summary: "Terminer l'Approbation avec succès ",
          detail: "L'Approbation a bien été terminee succès",
          life: 3000,
        })
      );
      FindOneCreidit()
      fetchAmortissements()


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
    }
  };




  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100" id="loadingmobile">
        <div className="spinner-border" role="status" />
      </div>
    );
  }


  const montantTotal = ldetails[0]?.remboursement_credit?.MONTANT_CAPITAL;
  const Nom = ldetails[0]?.remboursement_credit?.utilisateur?.NOM;
  const Prenom = ldetails[0]?.remboursement_credit?.utilisateur?.PRENOM;



  return (
    <>

      {isSubmitting ? <Loading /> : null}

      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="row">
            <div className="d-flex align-items-center justify-content-between">
              <div className="card is-mobile d-flex round-indicator hide-on-mobile" style={{ padding: 0 }}>
                <Image
                  //src={commande}r
                  alt="Image"
                  imageClassName="rounded-4 object-fit-cover hide-on-mobile"
                  imageStyle={{ width: "150px", height: "150px" }}
                />
              </div>

            </div>
          </div>

          <Button
            className="mt-3 ml-3 button-mobile px-2 py-1"
            label="Retour"
            size="small"
            onClick={() => {
              navigate("/remboursement_credit");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-code" viewBox="0 0 16 16">
              <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z" />
            </svg>
          </Button>
        </div>



        <div className="container-fluid px-3 mt-3 ">
          {/* Groupe 1: Membre et Montant demandé */}
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex ms-1 align-items-center py-1">
                <div className="col-md-5">
                  <label className="label ">Utilisateur</label>
                </div>
                <div className="col-sm  ms-2">:
                   <span className="font-bold">
                    {Nom} {Prenom || '-'}

                  </span>
                </div>

              </div>
              <hr className="my-1" />
            </div>
            <div className="col-md-6">
              <div className="d-flex ms-1 align-items-center py-1">
                <div className="col-md-5">
                  <label className="label ">Montant total</label>
                </div>
                <div className="col-sm  ms-2">:
                  <span className="font-bold">
                    {parseFloat(montantTotal) ? parseFloat(montantTotal).toLocaleString('fr-FR') : 0} Fbu

                  </span>
                </div>

              </div>
              <hr className="my-1" />
            </div>
          </div>


        </div>




        {modes.statutscre?.ID_STATUTS_CREDIT !== STATUTS_CREDIT.EN_ATTENTE_DE_VALIDATION && (
          <div className=" rounded my-2 pr-1 bg-white ms-2">
            <h6 className="ms-2">Detail remboursement</h6>
            <DataTable
              value={ldetails}
              editMode="row"
              size="small"
              dataKey="ID_AMORTISSEMENTS"
              //onRowEditComplete={onRowEditComplete}
              selection={selectedItems}
              // onSelectionChange={onSelectionChange}
              selectAll={selectAll}
              // style={{ padding: ' 0.25rem 0.25rem;' }}
              // onSelectAllChange={onSelectAllChange}
              emptyMessage="Aucun élément trouvé"
              resizableColumns
            >
              <Column
                field="NUMERO_ECHEANCE"
                frozen
                header="N.Remboursement"
                sortable
                body={(item) => {
                  return (
                    <span>
                      {item.remboursement_credit?.REFERENCE_REMBOURSEMENT ? item.remboursement_credit?.REFERENCE_REMBOURSEMENT : "-"}
                    </span>
                  );
                }}
              />
              <Column
                field="MONTANT_CAPITAL"
                frozen
                header="Montant capital"
                sortable
                body={(item) => {
                  return (
                    <span>
                      {`${parseFloat(item.MONTANT_CAPITAL).toLocaleString('fr-FR')} Fbu`}
                    </span>
                  );
                }}
              />


              <Column
                field="MONTANT_INTERET"
                frozen
                header="Interet"
                sortable
                body={(item) => {
                  return (
                    <span>
                      {`${parseFloat(item.MONTANT_INTERET).toLocaleString('fr-FR')} Fbu`}
                    </span>
                  );
                }}
              />



              <Column
                field="MONTANT_PENALITE"
                frozen
                header="Penalite "
                sortable
                body={(item) => {
                  return (
                    <span>
                      {`${parseFloat(item.MONTANT_PENALITE).toLocaleString('fr-FR')} Fbu`}
                    </span>
                  );
                }}
              />



              <Column
                field="DATE_ENREGISTREMENT"
                header="Date"
                sortable
                body={(item) => {
                  const date = new Date(item.DATE_ENREGISTREMENT);
                  return date.toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',

                  })
                }}

              />

            </DataTable>

          </div>)}


        <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">

        </div>
      </div >
    </>
  );
}
























