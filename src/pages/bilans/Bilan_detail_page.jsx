
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
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams,Outlet } from "react-router-dom";
import { Image } from "primereact/image";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from "primereact/dialog";
import venteMed from '../../../public/images/vente_medicament.png'
import { InputTextarea } from "primereact/inputtextarea";
import statutVenteColor from "../../helpers/statutVenteColor";
import STATUT_VENTE from "../../constants/STATUT_VENTE";
import { decodeId, encodeId } from "../../utils/IdEncryption";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import entete from "../../../public/images/entete_exode.jpg";
import bilanv from "../../../public/images/bilan.png";
import { Tooltip } from 'primereact/tooltip';
import statutDepenseColor from "../../helpers/statutDepenseColor";
import STATUT_DEPENSE from "../../constants/STATUT_DEPENSE";
import { FileUpload } from "primereact/fileupload";
import PROFILS from "../../constants/PROFILS";
import { userSelector } from "../../store/selectors/userSelector";
const initialForm = {
  // MONTANT_PAYE: '',
  // selectedCompte: '',
  selectedCompte: null,
  // DATE_PAIEMENT:null

};
export default function Bilan_detail_page() {
  const dispacth = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const Idrls = decodeId(id);
  const { ID_BILAN: encodedStr } = useParams();
  const ID_BILAN = decodeId(encodedStr)
  const user = useSelector(userSelector)
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [selectMedicament_stock, setSelectMedicament_stock] = useState([]);
  const [dateRec, setDateRec] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [loadingModes, setLoadingModes] = useState(true);
  const [selectedItems, setSelectedItems] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [modes, setModes] = useState(null)
  const [showTextarea, setShowTextarea] = useState(false);
  const [showReduction, setShowReduction] = useState(false);
  const [showTableRemise, setShowTableRemise] = useState(false);
  const [errorNote, setErrorNote] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownVisibledate, setDropdownVisibledate] = useState(false);
  const [iconVisible, setIconVisible] = useState(true);
  const [iconVisibledate, setIconVisibledate] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [unitPrice, setUnitPrice] = useState(null);
  const [qteDisponile, setQteDisponile] = useState(null);
  const [unitAchat, setUnitAchat] = useState(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDateRec, setSelectedDateRec] = useState(null);
  const [selectReduction, setSelectReduction] = useState(null);
  const [dates, setDates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ldetails, setLdetails] = useState([])
  const [pdfUrl, setPdfUrl] = useState(null);
  const [categorie, setCategorie] = useState([]);
  const [isApproved, setIsApproved] = useState(true);
  const [bilan, setBilan] = useState([])
  const [comptes, setComptes] = useState([])
  const [montant_debit, setMontant_debit] = useState(null)
  const [montant_credit, setMontant_credit] = useState(null)
  const [selectedCompte, setSelectedCompte] = useState(null);
  const [detailBilan,setDetailBilan] = useState([])

  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError, } = useFormErrorsHandle({ ...data, selectedCompte },
    {
      // CATEGORIE_ID: {
      //   required: true,
      // },
      selectedCompte: {
        required: false,
      },
      // JUSTIFICATIF: {
      //   // required: true,
      //   image: 4000000
      // },

    },
    {
      selectedCompte: {
        required: "Ce champ est obligatoire",
      },
      // DESCRIPTION: {
      //   required: "Ce champ est obligatoire",
      // },
      // // JUSTIFICATIF: {
      //   // required: "Ce champ est obligatoire",
      //   image: "L'image ne doit pas depasser 4Mo "
      // },


    },

  );
  //   // Logique pour approuver ou annuler
  const handleToggleCancellation = (e) => {
    e.preventDefault();
    handleAnnulation(e, ID_FICHE_DEPENSES ? ID_FICHE_DEPENSES : id);
  };

  const handleCompteChange = (e) => {
    setSelectedCompte(e.value);
    const cpm = e.value ? comptes.find(c => c.code === e.value.code) : null;

  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("COMPTE_ID", selectedCompte?.code);
        form.append("ID_BILAN", id);

        const res = await fetchApi(`/bilan/bilan/createdetail`, {
          method: "POST",
          body: form,
        });
        FindListeDetailsBilan()
       FindoneBilan()
        handleUpdateActifPassif()
        FindListeDetailsCommdeMp()
        dispacth(
          setToastAction({
            severity: "success",
            summary: "Detail bilan ajoutée",
            detail: "Detail bilan a bien été  ajoutée dans un bilan ",
            life: 3000,
          })
        );
   
        // findonecommandClient();

        setData({
          MONTANT: "", DESCRIPTION: "",
        });
        setSelectedProduct(null);
        setSelectReduction(null);

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
      } else if (error.httpStatus == "NOT_FOUND") {
        console.log(getErrors());
        setErrors(getErrors());
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
      }
      else if (error.httpStatus == "BAD_REQUEST") {
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "warn",
            summary: "Erreur lors d'ajouter",
            detail: "La quantite des medicaments vente ne doit pas superieur à la quantite disponile",

            life: 5000,
          })
        )
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        const mainContent = document.querySelector(".main_content")
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            mainContent.scrollY -
            headerHeight;
          mainContent.scrollTo({
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
  const FindoneBilan = useCallback(async () => {
    try {

      const baseurl = id ? `/bilan/bilan/findOne/${id}` : `/bilan/bilan/findOne/${ID_BILAN}`;

      var url = await fetchApi(baseurl);
      const res = url
      const cmde = res.result;

      // console.log(cmde, "foundfoundfoundfoundfound")
      setModes(cmde);
      //   setBilan(cmde)


    } catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  }, [id, ID_BILAN]);

  useEffect(() => {
    FindoneBilan()
  }, [id, ID_BILAN])

  const FindoneMontant_debit_credit = useCallback(async () => {
    try {

      const baseurl = `/bilan/bilan/findMontant/${selectedCompte.code}`;
      var url = await fetchApi(baseurl);
      const res = url
      // const cmde = res.result;
      setMontant_debit(res.result.monatantDebit)
      setMontant_credit(res.result.monatantCredit)

     
      // setModes(cmde);
      //   setBilan(cmde)


    } catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  }, [selectedCompte]);

  useEffect(() => {
    FindoneMontant_debit_credit()
  }, [selectedCompte])

  // console.log("compte:", selectedCompte?.code)

  //  console.log(montant_credit, "FFFFFFFFFFFFFFFFFFFFFFFFFFFF")
  //liste deroulante des categories
  //   const fetchCategorieDepense = useCallback(async () => {
  //     try {
  //       const baseurl = `/depenses/categorieDepense/fetch?row=100000&`;
  //       var url = baseurl;
  //       const res = await fetchApi(url);

  //       const updatedRef = res.result.data.map((clt) => ({
  //         name: `${clt.NOM_DEPENSES}`,
  //         code: clt.ID_CATEGORIES_DEPENSES,
  //       }));
  //       setCategorie(updatedRef);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }, []);
  //   useEffect(() => {
  //     fetchCategorieDepense();
  //   }, []);



  const handleProductListChangeDateRec = (options) => (e) => {
    const selectedDate = e.value; // Récupérer la date sélectionnée

    setSelectedDateRec(selectedDate); // Mettre à jour l'état local

    // Trouver l'objet correspondant dans `dateRec`
    const selectedProduct = dateRec.find(product => product.date === selectedDate);

    // Mettre à jour `DATE_EXP` au lieu de `ID_STOCK`
    options.rowData.DATE_EXP = selectedDate;

    if (selectedProduct) {
      const newPrice = selectedProduct.price;
      const newPriceAchat = selectedProduct.priceAchat
      const newQteDisp = selectedProduct.qteDisp

      setUnitPrice(newPrice); // Mettre à jour l'état du prix unitaire
      options.rowData.PRIX_UNIT = newPrice;

      setQteDisponile(newQteDisp); // Mettre à jour l'état du prix unitaire
      options.rowData.QTE = newQteDisp;

      setUnitAchat(newPriceAchat)
      options.rowData.PRIX_ACHAT = newPriceAchat
    }

    // Appeler `editorCallback` avec la nouvelle valeur
    if (options.editorCallback) {
      options.editorCallback(selectedDate);
    }
  };


  const handleProductChange = (e) => {
    setSelectedProduct(e.value);

    const product = e.value ? selectMedicament_stock.find(prod => prod.code === e.value.code) : null;

    setUnitPrice(product ? product.price : ''); // Mise à jour du prix unitaire
    setUnitAchat(product ? product.priceAchat : '');
    setQteDisponile(product ? product.qteDisp : '')
  };


  useEffect(() => {
    document.title = "Dépense détails"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'fiche_depenses',
        name: 'Liste'
      },
      {
        path: 'fiche_depenses/details',
        name: 'Détails'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);


  const [modePaiement, setModePaiement] = useState([
    {
      code: 0,
      name: 'Espèce'
    },
    {
      code: 1,
      name: 'Bancaire'
    },
    {
      code: 2,
      name: 'Virement'
    },

  ]);




  const toggleDropdowndate = () => {
    setDropdownVisibledate(!dropdownVisibledate);
    setIconVisibledate(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setIconVisible(false);
  };
  const annuler = () => {
    setDropdownVisible(false);
    setIconVisible(true);
  };

  const annulerDate = () => {
    setDropdownVisibledate(false);
    setIconVisibledate(true);
  };
  const modifierDate = async () => {
    const form = new FormData();
    form.append("DATE_DEPENSE", data.DATE_DEPENSE);
    const url = id ? `/depenses/fiche_depenses/EditerDepense/${id}` : `/depenses/fiche_depenses/EditerDepense/${ID_FICHE_DEPENSES}`;
    try {
      const res = await fetchApi(url, {
        method: "put",
        body: form,
      });

      const updatedModes = {
        ...modes,
        DATE_DEPENSE: data.DATE_DEPENSE
      };
      //   setModes(updatedModes);
      annulerDate();
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const modifierTypepaiement = async () => {
    const form = new FormData();
    form.append("MODE_PAIEMENT", data.MODE_PAIEMENT.code);
    const url = id ? `/depenses/fiche_depenses/EditerDepense/${id}` : `/depenses/fiche_depenses/EditerDepense/${ID_FICHE_DEPENSES}`;
    try {
      const res = await fetchApi(url, {
        method: "put",
        body: form,
      });

      const updatedModes = {
        ...modes,
        MODE_PAIEMENT: data.MODE_PAIEMENT.code
      };
      //   setModes(updatedModes);
      annuler();
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };




  const FindListeDetailsCommdeMp = useCallback(async () => {
    try {
      setLoading(true);
      let baseurl;
      if (id) {
        baseurl = await fetchApi(`/depenses/fiche_depenses/findDetailDepense/${id}`);
      } else {
        baseurl = await fetchApi(`/depenses/fiche_depenses/findDetailDepense/${ID_FICHE_DEPENSES}`);
      }
      var url = baseurl;
      const res = url

      setLdetails(res.result);
      setSelectedItems(res.result);
      setSelectAll(true)
      setInViewMenuItem(res.result)


    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    FindListeDetailsCommdeMp()

  }, [])
 


  const saveModifiedDataToDatabase = async (modifiedData) => {
    const form = new FormData();
    // console.log(modifiedData);

    form.append("dataliste", JSON.stringify(modifiedData));
    const url = `/depenses/fiche_depenses/editDetailDepense/${modifiedData.ID_DETAILS_DEPENSES}`;
    try {
      const res = await fetchApi(url, {
        method: "PUT",
        body: form,
      });
      FindListeDetailsCommdeMp()
      findonecommandClient();

    } catch (error) {
      console.error("Error occurred:", error);
    }
  };
  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedItems(value);
    setSelectAll(ldetails ? value.length === ldetails.length : false);
  };


  const onSelectAllChange = (event) => {
    const selectAll = event.checked;
    if (selectAll) {
      setSelectAll(true);
      setSelectedItems(ldetails);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };

  const onRowEditComplete = (e) => {
    const { newData } = e;
    //  console.log('ehehhe',e);

    if (!newData || typeof newData !== 'object') {
      console.error('newData is undefined or not an object');
      return;
    }


    const modifiedData = {
      ID_DETAILS_DEPENSES: newData.ID_DETAILS_DEPENSES,
      CATEGORIE_ID: newData.categorie.CATEGORIE_ID,
      DESCRIPTION: newData.DESCRIPTION,
      MONTANT: newData.MONTANT,
      JUSTIFICATIF: newData.JUSTIFICATIF,
    };

    // Update selectedItems and ldetails arrays
    const newSelectedItems = selectedItems.map((c) => {
      if (c.ID_DETAILS_DEPENSES === newData.ID_DETAILS_DEPENSES) {
        return {
          ...c,
          CATEGORIE_ID: newData.categorie.CATEGORIE_ID,
          DESCRIPTION: newData.DESCRIPTION,
          MONTANT: newData.MONTANT,
          JUSTIFICATIF: newData.JUSTIFICATIF,
        };
      }
      return c;
    });

    const newLdetails = ldetails.map((c) => {
      if (c.ID_DETAILS_DEPENSES === newData.ID_DETAILS_DEPENSES) {
        return {
          ...c,
          CATEGORIE_ID: newData.categorie.CATEGORIE_ID,
          DESCRIPTION: newData.DESCRIPTION,
          MONTANT: newData.MONTANT,
          JUSTIFICATIF: newData.JUSTIFICATIF,
        };
      }
      return c;
    });

    setSelectedItems(newSelectedItems);
    setLdetails(newLdetails);
    saveModifiedDataToDatabase(modifiedData);
  };



  const handleProductListChange = (options) => (e) => {
    const value = e.target.value;
    setSelectedProduct(value);
    const selectedProduct = categorie.find(product => product.code === value);
    options.rowData.categorie.CATEGORIE_ID = value;
    // Appeler editorCallback avec la nouvelle valeur
    options.editorCallback(value);
  };


  const categoriesEditor = (options) => {

    // console.log(options);

    const isSelected = selectedItems ? selectedItems.find(c => c.ID_DETAILS_DEPENSES === options.rowData.ID_DETAILS_DEPENSES) : false;
    if (!isSelected) {
      return <span>-</span>;
    } else {
      return (
        <div className="d-flex align-items-center">

          <Dropdown
            value={options.rowData.categorie.CATEGORIE_ID}
            options={categorie}
            onChange={handleProductListChange(options)}
            optionLabel="name"
            optionValue="code"
            placeholder="Sélectionner une catégorie"
            className="w-100"
          />

        </div>
      );
    }
  };

  const descriptionEditor = (options) => {
    //console.log(options.rowData.ID_LIST_BON_COMAND_APROV);
    const isSelected = selectedItems ? selectedItems.find(c => c.ID_DETAILS_DEPENSES === options.rowData.ID_DETAILS_DEPENSES) : false;


    if (!isSelected) {
      return <span>-</span>;
    } else {
      return (
        <div className="d-flex align-items-center">

          <InputText
            type="text"
            value={options.rowData.DESCRIPTION}
            onChange={(e) => {
              const value = e.target.value;
              options.rowData.DESCRIPTION = value;
              options.editorCallback(value);
            }}
            className="w-100"
          />

        </div>
      );
    }
  }


  const montantEditor = (options) => {
    //console.log(options.rowData.ID_LIST_BON_COMAND_APROV);
    const isSelected = selectedItems ? selectedItems.find(c => c.ID_DETAILS_DEPENSES === options.rowData.ID_DETAILS_DEPENSES) : false;


    if (!isSelected) {
      return <span>-</span>;
    } else {
      return (
        <div className="d-flex align-items-center">

          <InputText
            type="text"
            value={options.rowData.MONTANT}
            onChange={(e) => {
              const value = e.target.value;
              options.rowData.MONTANT = value;
              options.editorCallback(value);
            }}
            className="w-100"
          />

        </div>
      );
    }
  }

  const ImageEditor = (options) => {
    const isSelected = selectedItems ? selectedItems.find(c => c.ID_DETAILS_DEPENSES === options.rowData.ID_DETAILS_DEPENSES) : false;
    if (!isSelected) {
      return <span>-</span>;
    } else {
      return (
        <>
          {modes?.STATUT === STATUT_DEPENSE.APPROUVE ? (
            <>
              <div className="d-flex align-items-center">

                <FileUpload
                  chooseLabel="Choisir l'image"
                  cancelLabel="Annuler"
                  name="JUSTIFICATIF"
                  uploadOptions={{
                    style: { display: "none" },
                  }}
                  // className="p-invalid"
                  accept="image/*"
                  maxFileSize={4000000}
                  invalidFileSizeMessageDetail="Image est trop lourd"
                  emptyTemplate={
                    <p className="m-0">Glisser et déposez l'image ici.</p>
                  }
                  //           onSelect={async (e) => {
                  //             const file = e.files[0];
                  //             setValue("IMAGE", file);
                  //           }}



                  onSelect={async (e) => {
                    const file = e.files[0];
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);

                      // ✅ Met à jour la valeur du champ IMAGE dans le formulaire
                      setValue("JUSTIFICATIF", imageUrl);

                      // ✅ Met à jour directement la ligne dans le tableau
                      options.rowData.IMAGE = imageUrl;

                      // ✅ Met à jour la table (PrimeReact Table supporte `editorCallback`)
                      options.editorCallback(imageUrl);
                    }
                  }}
                  onClear={() => {
                    setError("JUSTIFICATIF", {});
                  }}
                  className={`${hasError("JUSTIFICATIF") ? "p-invalid" : ""}`}
                />

              </div>
            </>
          ) : null}



        </>);
    }
  };

  const [dataC, setDataC] = useState(ldetails);

  const updateData = (id, field, value) => {
    const newData = dataC.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value
        };
      }
      return item;
    });
    setDataC(newData);
  };

  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");



  const deleteItems = async (itemsIds) => {
    try {
      setGloabalLoading(true)
      const form = new FormData()
      form.append('ids', JSON.stringify(itemsIds))
      const res = await fetchApi("/depenses/fiche_depenses/deleteListeDetailDepense", {
        method: 'POST',
        body: form

      })

      dispacth(setToastAction({ severity: 'success', summary: 'Vente supprimé', detail: "La vente a été supprimé avec succès", life: 3000 }))
      FindListeDetailsCommdeMp()
      findonecommandClient();
      setSelectAll(false)
      setSelectedItems(null)
    } catch (error) {
      console.log(error)
      dispacth(setToastAction({ severity: 'error', summary: 'Erreur du système', detail: 'Erreur du système, réessayez plus tard', life: 3000 }));
    } finally {
      setGloabalLoading(false)
    }
  }

  const handleSelect = (id) => {
    setSelectedId(id); // Met à jour selectedId avec l'identifiant sélectionné
  };

  const handleDeletePress = (e, itemsids) => {
    e.preventDefault()
    e.stopPropagation()

    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Supprimer ?",

      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment supprimer ?
          </div>
        </div>

      ),
      acceptClassName: 'p-button-danger',
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        deleteItems(itemsids)
      },

    });
  }
  //Fonction pour une  demande approuve
  const handleDemandeApprouveItems = async (id) => {
    try {
      const res = await fetchApi(`/depenses/fiche_depenses/envoyeDemandeApprouve/${id}`, {
        method: "get",
      });
      dispacth(
        setToastAction({
          severity: "success",
          summary: 'Envoi de la demande.',
          detail: "L'envoi de la demande a été effectué avec succès.",
          life: 3000,
        })
      );
      FindListeDetailsCommdeMp()
      findonecommandClient();

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


  const handleDemandeApprouve = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Demander approuve ?",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment demander approuve?
          </div>
        </div>
      ),

      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: async () => {
        try {
          handleDemandeApprouveItems(itemsIds);
        } catch (error) {
          console.error("Erreur lors de la validation :", error);
        }
      },
    });
  };


  //Fonction pour une  annulation depense
  const handleAnnulationItems = async (id) => {
    try {
      const res = await fetchApi(`/depenses/fiche_depenses/AnnulationDepense/${id}`, {
        method: "get",
      });
      dispacth(
        setToastAction({
          severity: "success",
          summary: 'Annulation',
          detail: "L'annulation a été effectué avec succès.",
          life: 3000,
        })
      );
      FindListeDetailsCommdeMp()
      findonecommandClient();

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


  const handleAnnulation = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Demander approuve ?",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment annuler la dépense?
          </div>
        </div>
      ),

      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: async () => {
        try {
          handleAnnulationItems(itemsIds);
        } catch (error) {
          console.error("Erreur lors de la validation :", error);
        }
      },
    });
  };

  //Fonction pour une  approuve
  const handleApprouveItems = async (id) => {
    try {
      const res = await fetchApi(`/depenses/fiche_depenses/envoyeApprouve/${id}`, {
        method: "get",
      });
      dispacth(
        setToastAction({
          severity: "success",
          summary: 'Paiement .',
          detail: "Le paiement de la dépense a été effectué avec succès.",
          life: 3000,
        })
      );
      FindListeDetailsCommdeMp()
      findonecommandClient();

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


  const handleApprouve = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Approuve ?",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment approuve?
          </div>
        </div>
      ),

      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: async () => {
        try {
          handleApprouveItems(itemsIds);
        } catch (error) {
          console.error("Erreur lors de la validation :", error);
        }
      },
    });
  };

  //Fonction pour paiement la depense
  const handlePaiementItems = async (id) => {
    try {
      const res = await fetchApi(`/depenses/fiche_depenses/paiementDepense/${id}`, {
        method: "get",
      });
      dispacth(
        setToastAction({
          severity: "success",
          summary: 'Paiement .',
          detail: "Le paiement de la dépense a été effectué avec succès.",
          life: 3000,
        })
      );
      FindListeDetailsCommdeMp()
      findonecommandClient();

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
      } else if (error.httpStatus == "BAD_REQUEST") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur Solde ",
            detail: "Erreur Solde insuffisant",
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


  const handlePaiement = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Paiement?",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment payé?
          </div>
        </div>
      ),

      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: async () => {
        try {
          handlePaiementItems(itemsIds);
        } catch (error) {
          console.error("Erreur lors de la validation :", error);
        }
      },
    });
  };

 const FindListeDetailsBilan = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = id ? `/bilan/bilan/findAllDetail/${id}` : `/bilan/bilan/findAllDetail/${ID_BILAN}`;
      var url = await fetchApi(baseurl);
      const res = url
      setDetailBilan(res.result);
      setSelectedItems(res.result)
      setSelectAll(true)
      // console.log(res.result, "finddd")
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    FindListeDetailsBilan()
  }, [])





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
  const fetchComptes = useCallback(async () => {
    try {
      const res = await fetchApi(`/plancomptable/comptescomptables/fetch?`);
      if (res && res.result && res.result.data) {
        setComptes(res.result.data.map(access => ({
          name: `${access.NOM} ${access.CODE}`,              // Garde le libellé lisible
          code: access.ID_COMPTES_COMPTABLES, // ✅ code est un number pur
        })));
      } else {
        console.error("Données non trouvées dans la réponse.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes :", error);
    }
  }, []);

  useEffect(() => {
    fetchComptes();
  }, [fetchComptes]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100" id="loadingmobile">
        <div className="spinner-border" role="status" />
      </div>
    );
  }


const totalValue = detailBilan
  .filter(commde => commde.nom_compte && commde.nom_compte.TYPE === 0) // Filtrer selon la condition
  .reduce((total, commde) => {
    if (commde && commde.CREDIT
) {
      return total + parseFloat(commde.CREDIT
);
    }
    return total;
  }, 0);

const montantActif = totalValue !== null ? totalValue.toLocaleString('fr') : '';
// console.log(montantActif,"hshhsh")
const totalValuee = detailBilan
  .filter(commde => commde.nom_compte && commde.nom_compte.TYPE === 1) // Filtrer selon la condition
  .reduce((total, commde) => {
    if (commde && commde.CREDIT
) {
      return total + parseFloat(commde.CREDIT
);
    }
    return total;
  }, 0);

const montantPassif = totalValuee !== null ? totalValuee.toLocaleString('fr') : '';
const handleUpdateActifPassif = async (e) => {
    try {
      // e.preventDefault();
  
        // setIsSubmitting(true);
        const form = new FormData();
        form.append("TOTAL_PASSIF", montantPassif);
        form.append("TOTAL_ACTIF", montantActif);
      

        const res = await fetchApi(`/bilan/bilan/edif_passif_actif/${ID_BILAN}`, {
          method: "PUT",
          body: form,
        });
        
       
    
    } catch (error) {
      console.log(error);
      
    } finally {
      setIsSubmitting(false);
    }
  };
  //   useEffect(() => {
  //   handleUpdateActifPassif()
  // }, [handleSubmit])
 
   return (
         <>
             <ConfirmDialog closable dismissableMask={true} />
             {globalLoading && <Loading />}
 
             <style>{`
             tr {
                 height: 50px;
             }
             td {
                 padding: 2px;
                 text-align: center; /* Centrer les valeurs */
             }
         `}</style>
 
             <div className="px-4 py-3 main_content">
                 <div className="d-flex align-items-center justify-content-center">
                     <h1 className="mb-3">Bilan du le {moment(modes.CREATED_AT).format("DD/MM/YYYY")}</h1>
                 </div>
                 <div className="row d-flex bg-light">
                     <table className="table w-s100 col-8" style={{ border: "4px solid #fb8c8c" }}>
                         <tr className="">
                             <td style={{ backgroundColor: "#143d8f", color: "white" }} className="font-bold bordesr borders-3 border-dark " colSpan={6}>Actif</td>
                         </tr>
                         <tr>
                             <td className="p-smd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>N° Compte</td>
                             <td className="p-msd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Libelle</td>
                             <td className="p-mjd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Valeur Brute</td>
                             <td className="p-mjd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Valeur Résiduelle</td>
                             <td className="p-mjd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Amortissement</td>
                             <td className="p-mjd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Valeur Nette</td>
                         </tr>
                         <tr>
                             <td style={{ borderRight: "none" }} className="font-bold">I Valeur Immobilisée</td>
                         </tr>
                         <tr>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>223</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Équipements/Matériel</td>
                             <td className="p-md-0 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.VALEUR_BRUTTE)} FBu`}</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.VALEUR_RESIDUEL)} FBu`}</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.AMORTISSEMENT)} FBu`}</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.VALEUR_NETTE)} FBu`}</td>
                         </tr>
                         <tr>
                             <td style={{ borderRight: "none" }} className="font-bold">II Valeur d'exploitation</td>
                         </tr>
                         <tr>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>202</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Créance</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.CREANCE)} FBu`}</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.CREANCE)} FBu`}</td>
                         </tr>
                         <tr>
                             <td style={{ borderRight: "none", backgroundColor: "teaxl" }} className="font-bold">III Valeur disponible</td>
                         </tr>
                         <tr>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>201</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Banque</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.BANQUE)} FBu`}</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.BANQUE)} FBu`}</td>
 
                         </tr>
                         <tr>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>401</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Caisse</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.CAISSE)} FBu`}</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.CAISSE)} FBu`}</td>
                         </tr>
                         <tr style={{ height: '50px', backgroundColor: "#143d8f", color: "white" }}>
                             <td className="font-bold" style={{ width: "50px", fontSize: '20px' }} colSpan={6}>
                                 Total actif:{`${new Intl.NumberFormat('fr-FR').format(modes.TOTAL_ACTIF)} FBu`}
                             </td>
                         </tr>
                     </table>
                     <table style={{ border: "4px solid #fb8c8c" }} className="table w-s100  col-4">
                         <tr style={{ height: '50px', backgroundColor: "#143d8f", color: "white" }}>
                             <td className="font-bold  " colSpan={6}>Passif</td>
                         </tr>
                         <tr style={{ height: '50px' }}>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>N° Compte</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Libelle</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Montant</td>
                         </tr>
                         <tr style={{ height: '50px' }}>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>300</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Capital</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.CAPITAL)} FBu`}</td>
                         </tr>
                         <tr style={{ height: '50px' }}>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>303</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Resultant</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.RESULTANT)} FBu`}</td>
                         </tr>
                         <tr style={{ height: '50px' }}>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                         </tr>
                         <tr style={{ height: '50px' }}>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>402</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Caisse Social</td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(modes.CAISSE_SOCIAL)} FBu`}</td>
                         </tr>
                         <tr style={{ height: '50px' }}>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                         </tr>
                         <tr style={{ height: '50px' }}>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                         </tr>
                         <tr style={{ height: '50px' }}>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                             <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
                         </tr>
                         <tr style={{ height: '50px', backgroundColor: "#143d8f", color: "white" }}>
                             <td className="font-bold" style={{ width: "50px", fontSize: '20px' }} colSpan={6}>
                                 Total Passif:{`${new Intl.NumberFormat('fr-FR').format(modes.TOTAL_PASSIF)} FBu`}
                             </td>
                         </tr>
                     </table>
                     </div>
                     {/* <button  onClick={() => {
                           handleSubmit()
                    
                         }} style={{backgroundColor:"#143d8f"}} className="btn btn-primary btn-md">Conserver</button>
                */}
             </div>
               
             <Outlet />
         </>
     );
}





























