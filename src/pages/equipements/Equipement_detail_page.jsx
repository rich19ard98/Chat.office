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
import { useNavigate, useParams } from "react-router-dom";
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
export default function Equipement_detail_page() {
  const dispacth = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const Idrls = decodeId(id);
  const { ID_EQUIP: encodedStr } = useParams();
  const ID_EQUIP = decodeId(encodedStr)
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
  const [detailEquipements,setDetailEquipements] = useState([])

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
        form.append("ID_EQUIP", id);

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

      const baseurl = id ? `/equipements/equipements/findOne/${id}` : `/equipements/equipements/findOne/${ID_EQUIP}`;

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
  }, [id, ID_EQUIP]);

  useEffect(() => {
    FindoneBilan()
  }, [id, ID_EQUIP])

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
    const newData = dataC?.map(item => {
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

 const FindListeDetailsEquipement = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = id ? `/equipements/equipements/findAmortissement/${id}` : `/equipements/equipements/findAmortissement/${ID_EQUIP}`;
      var url = await fetchApi(baseurl);
      const res = url
      setDetailEquipements(res.result);
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
    FindListeDetailsEquipement()
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
  // const fetchComptes = useCallback(async () => {
  //   try {
  //     const res = await fetchApi(`/plancomptable/comptescomptables/fetch?`);
  //     if (res && res.result && res.result.data) {
  //       setComptes(res.result.data?.map(access => ({
  //         name: `${access.NOM} ${access.CODE}`,              // Garde le libellé lisible
  //         code: access.ID_COMPTES_COMPTABLES, // ✅ code est un number pur
  //       })));
  //     } else {
  //       console.error("Données non trouvées dans la réponse.");
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des comptes :", error);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchComptes();
  // }, [fetchComptes]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100" id="loadingmobile">
        <div className="spinner-border" role="status" />
      </div>
    );
  }




// const montantPassif = totalValuee !== null ? totalValuee.toLocaleString('fr') : '';
const handleUpdateActifPassif = async (e) => {
    try {
      // e.preventDefault();
  
        // setIsSubmitting(true);
        const form = new FormData();
        form.append("TOTAL_PASSIF", montantPassif);
        form.append("TOTAL_ACTIF", montantActif);
      

        const res = await fetchApi(`/bilan/bilan/edif_passif_actif/${ID_EQUIP}`, {
          method: "PUT",
          body: form,
        });
        console.log("OkKK")
       
    
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
      {/* <ConfirmDialog /> */}
      {isSubmitting ? <Loading /> : null}
      <Dialog header="Détails" visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }}>
        <p className="m-0">
          {modes?.DESCRIPTION}
        </p>
      </Dialog>
      <div className="px-4 py-3 main_content bg-white has_footer">

        <div className="row">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="row">
              <div className="d-flex align-items-center justify-content-between ">
                <div className="card shadow-4 is-mobile d-flex round-indicator hide-on-mobile " style={{ padding: 0 }} >
                  <Image
                    src={bilanv}
                    alt="Image"
                    imageClassName="rounded-4 object-fit-cover hide-on-mobile"
                    imageStyle={{ width: "180px", height: "180px" }}

                  />
                </div>
                <div className="col-sm ml-4 " id="nos-margin-left">
                  <div className="row d-flex align-items-center">
                    <div className="col-md-4 ">
                      <label className="label mb-1"> Réf&nbsp;</label>
                    </div>
                    <div className="col-sm d-flex align-items-center">:<span className="font-bold">{modes?.CODE_EQUIP}</span> </div>
                  </div>
                  <div className="row d-flex align-items-center">
                    <div className="col-md-4 ">
                      <label className="label mb-1"> Utilisateur&nbsp; </label>
                    </div>
                    <div className="col-sm d-flex align-items-center">
                      <span className="font-bold"> : {modes.utilisateur?.NOM} {modes.utilisateur?.PRENOM}</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            <Button
              // className="p-button-text mr-2 p-button-rounded p-button-outlined  button-mobile"
              className=" mt-3 ml-3 button-mobile  px-2 py-1 "
              label="Retour"
              size="small"
              onClick={() => {
                navigate("/equipements");
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-code" viewBox="0 0 16 16">
                <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="row ">

          <div className="column w-50 mt-3">
            <div className="form-group col-sm">
              <div className="row">



              </div>
            </div>



          </div>







        </div>
        <div className="row">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div> </div>

          </div>
        </div>


        <div className="row ">

          <div className="column w-50 mt-3">
            <div className="form-group col-sm">
              <div className="row">
                <div className="col-md-4">
                  <label className="label mb-1"> Equipement</label>
                </div>

                <div className="col-sm">
                  <>
                    <span className="font-bold">:{modes?.compte?.NOM}</span>

                  </>




                </div>

              </div>
            </div>
            <hr className="mt-1" />


            <div className="form-group col-sm">
              <div className="row">
                <div className="col-md-4">
                  <label className="label mb-1"> Date d'aquisition</label>
                </div>
                <div className="col-sm">:

                  <>
                    <span className="font-bold"> {moment(modes?.DATE_AQUISITION).format("DD/MM/YYYY ")}</span>


                  </>


                  <span className="ml-2">


                  </span>

                </div>

              </div>
            </div>
            <hr className="mt-1" />
          </div>
          <div className="column w-50 mt-3">
            <div className="form-group col-sm">
              <div className="row">
                 <div className="col-md-4">
                  <label className="label mb-1">Valeur brute</label>
                </div>
                <div className="col-sm">:

                  <>
                    <span className="font-bold">{modes?.VALEUR_BRUTE}</span>


                  </>
               



                </div>

              </div>
            </div>
            <hr className="mt-1" />


            <div className="form-group col-sm">
              <div className="row">
               <div className="col-md-4">
                  <label className="label mb-1"> Delai de vie</label>
                </div>

                <div className="col-sm">
                  <>
                    <span className="font-bold">:{modes?.DUREE_VIE}</span>

                  </>



                  <span className="ml-2">


                  </span>

                </div>

              </div>
            </div>
            <hr className="mt-1" />
          </div>

          <div className="column w-50 mt-3 ">
            <div className="form-group col-sm">
              <div className="row">
                <div className="col-md-4">
                  <label className="label mb-1">Valeur nette </label>
                </div>
                <div className="col-sm">: <span className="font-bold">
                  {modes?.VALEUR_NETTE ? modes?.VALEUR_NETTE.toLocaleString('fr') : '0'} Fbu
                </span> </div>
              </div>
            </div>
            <hr className="mt-1" />

          
            {/* <hr className="mt-1" /> */}
          </div>
          <div className="column w-50 mt-3 ">
            <div className="form-group col-sm">
              <div className="row">
                <div className="col-md-4">
                  <label className="label mb-1">Amortissement cumile</label>
                </div>
                <div className="col-sm">: <span className="font-bold">
                  {modes?.AMORTISSEMENT_CUMULE}
                </span> </div>
              </div>
            </div>
            <hr className="mt-1" />

          
            {/* <hr className="mt-1" /> */}
          </div>


          <div className="column w-100  ">
            <div className="form-group col-sm">
              <div className="row">
                <div className="col-md-2">
                  <label className="label mb-1">Description</label>
                </div>
                <div className="col-sm " id="paddindleft">: <span className="font-bold">
                  {modes?.NOTE ? (
                    <span className="cursor-pointer" onClick={() => setVisible(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
                      </svg>
                    </span>
                  ) : '-'}
                </span>
                </div>
              </div>
            </div>
            <hr className="mt-1" />
          </div>



        </div>
  
 <div className=" rounded my-2 pr-1 bg-white">
            <h6>Détails d'amortissements</h6>
            <DataTable
              value={detailEquipements}
              editMode="row"
              size="small"
              dataKey="ID_EQUIP_AMORT"
              onRowEditComplete={onRowEditComplete}
              selection={selectedItems}
              onSelectionChange={onSelectionChange}
              selectAll={selectAll}
              style={{ padding: ' 0.25rem 0.25rem;' }}
              onSelectAllChange={onSelectAllChange}
              emptyMessage="Aucun détail du bilan"
              resizableColumns
            >
              <Column
                field=""
                header="#"
                headerStyle={{ fontSize: 14 }}
                body={(rowData, rowIndex) => {
                  const index = detailEquipements.indexOf(rowData) + 1;
                  return <span>{index}</span>;
                }}
              />



            



<Column
                field="COMPTE_ID"
                header="Annee"
                editor={(options) => priceEditor(options)}
                headerStyle={{ fontSize: 14 }}
                body={(item) => {
                  return (
                    <span>{item?.PERIODE}</span>
                  );
                }}
              />

              <Column
                field="CREDIT"
                header="Montant amortisse"
                editor={(options) => priceEditor(options)}
                headerStyle={{ fontSize: 14 }}
                body={(item) => {
                  return (
                    <span>{item.MONTANT_AMORTISSE ? parseFloat(item.MONTANT_AMORTISSE).toLocaleString('fr-FR') : 0} Fbu</span>
                  );
                }}
              />
                <Column
                field="DEBIT"
                header="Valeur cumule"
                editor={(options) => priceEditor(options)}
                headerStyle={{ fontSize: 14 }}
                body={(item) => {
                  return (
                    <span>{item.MONTANT_CUMULE ? parseFloat(item.MONTANT_CUMULE).toLocaleString('fr-FR') : 0} Fbu</span>
                  );
                }}
              />
               <Column
                field="DEBIT"
                header="Valeur nette"
                editor={(options) => priceEditor(options)}
                headerStyle={{ fontSize: 14 }}
                body={(item) => {
                  return (
                    <span>{item.VALEUR_NETTE ? parseFloat(item.VALEUR_NETTE).toLocaleString('fr-FR') : 0} Fbu</span>
                  );
                }}
              />




            




              <Column
                rowEditor
                headerStyle={{ width: "1%", minWidth: "8rem" }}
                bodyStyle={{ textAlign: "center" }}
                body={(rowData, options) => (
                  <>

                    {options.rowEditor?.editing ? (
                      <>

                        <Button

                          icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-floppy2-fill" viewBox="0 0 16 16">
                            <path d="M12 2h-2v3h2z" />
                            <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5V2.914a1.5 1.5 0 0 0-.44-1.06L14.147.439A1.5 1.5 0 0 0 13.086 0zM4 6a1 1 0 0 1-1-1V1h10v4a1 1 0 0 1-1 1zM3 9h10a1 1 0 0 1 1 1v5H2v-5a1 1 0 0 1 1-1" />
                          </svg>}
                          className=" p-button-text p-button-rounded mr-2 p-button-outlined "
                          onClick={(e) =>
                            options.rowEditor?.onSaveClick &&
                            options.rowEditor?.onSaveClick(e)
                          }
                          severity="secondary"
                        />

                        <Button

                          icon={<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                          </svg>}
                          className=" p-button-text p-button-rounded p-button-outlined"
                          onClick={(e) =>
                            options.rowEditor?.onCancelClick &&
                            options.rowEditor?.onCancelClick(e)
                          }
                          severity="warning"
                        />


                      </>
                    ) : (
                      <>
                        {/* {modes?.statutNote?.ID_STATUS_NOTE == STATUT_NOTE_FRAIS.EN_BROUILLION
                          ?
                          <>
                          
                            <Button
                              icon={<svg xmlns="http://www.w3.org/2000/svg"
                                width="52" height="52"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                className="bi bi-pen cursor-pointer">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                              </svg>

                              }
                              className="p-button-text  p-button-rounded p-button-outlined "
                              onClick={(e) =>
                                options.rowEditor?.onInitClick &&
                                options.rowEditor?.onInitClick(e)
                              }
                              severity="secondary"
                            />


                            <Button
                              icon={<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                              </svg>}
                              className=" p-button-text p-button-rounded p-button-outlined"
                              severity="danger"
                              onClick={

                                (e) =>
                                  handleDelete(e,
                                    [rowData.ID_DETAILS_NOTE_FRAIS],
                                  )
                              }
                            />

                          </> : <>

                          </>
                        } */}

                      </>
                    )}
                  </>
                )}
              />
              {/* {modes?.statutNote?.ID_STATUS_NOTE == STATUT_NOTE_FRAIS.PAYE||
              modes?.statutNote?.ID_STATUS_NOTE == STATUT_NOTE_FRAIS.PARTIEMENT_PAYE
          
              ?
              <Column
              header="Ajouter l'image"
                rowEditor
                headerStyle={{ width: "1%", minWidth: "8rem" }}
                bodyStyle={{ textAlign: "center" }}
                body={(rowData, options) => (
                  <>

                    {options.rowEditor?.editing ? (
                     null
                    ) : (
                      <>
                        
                          
                          <>
                          
                            <Button
                              icon={<svg xmlns="http://www.w3.org/2000/svg"
                                width="52" height="52"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                className="bi bi-pen cursor-pointer">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                              </svg>

                              }
                              className="p-button-text  p-button-rounded p-button-outlined "
                              onClick={(e) =>
                                options.rowEditor?.onInitClick &&
                                options.rowEditor?.onInitClick(e)
                              }
                              severity="secondary"
                            />


                           
                          </>
                           
                          
                       

                      </>
                    )}
                  </>
                )}
              />
:null}
               */}

            </DataTable>

          </div>
      </div>
    
      <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
        <>
          {/*      
          {modes?.statutNote?.ID_STATUS_NOTE === STATUT_NOTE_FRAIS.EN_COURS
            ?
            (
              <>
                {user.ID_PROFIL == 2||user.ID_PROFIL == 1 ? (<>


                  <Button
                    className=" mt-3 ml-3 button-mobile "
                    size="small"
                    onClick={(e) => {
                      handleApprouverCommende(e, ID_NOTE_FRAIS ? ID_NOTE_FRAIS : id)
                    }}
                  // onClick={() => {
                  //   const url = id?`/operation/note?id=${id}`:`/operation/note?id=${ID_NOTE_FRAIS}`;
                  //   navigate(url);


                  // }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-all" viewBox="0 0 16 16">
  <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
</svg>
                    <span className="ml-1" style={{ fontWeight: 'bold' }}>Approuvé</span>
                  </Button>
                  {dropdownVisible ? (
                    <>
                      <Button
                        className="mt-3 ml-3 button-mobile"
                        size="small"
                        onClick={
                          (e) => {
                            handleRejeterCommende(e, ID_NOTE_FRAIS ? ID_NOTE_FRAIS : id)
                            //toggleDropdown
                          }
                        }

                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
                          <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0" />
                          <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z" />
                        </svg>
                        <span className="ml-1" style={{ fontWeight: 'bold' }}>Confirmer</span>
                      </Button>


                      <Button
                        className="mt-3 ml-3 button-mobile"
                        size="small"
                        onClick={toggleDropdown}

                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
                          <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                        </svg>
                        <span className="ml-1" style={{ fontWeight: 'bold' }}>Retour</span>
                      </Button>

                    </>
                  ) : (
                    <Button
                      className="mt-3 ml-3 button-mobile"
                      size="small"
                      onClick={toggleDropdown}

                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x-octagon" viewBox="0 0 16 16">
                        <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z" />
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                      </svg>
                      <span className="ml-1" style={{ fontWeight: 'bold' }}>Rejeter</span>
                    </Button>

                  )}
                </>
                ) : null}
              </>
            ) : null
          } */}


          {/* {modes?.statutNote?.ID_STATUS_NOTE === STATUT_NOTE_FRAIS.EN_BROUILLION
            && ldetails.length > 0

            ?
            (
              <>

                <Button
                  className=" mt-3 ml-3 button-mobile "
                  size="small"
                  onClick={(e) => {
                    handleEnvoyerCommende(e, ID_NOTE_FRAIS ? ID_NOTE_FRAIS : id)

                  }}
                >
                   <svg xmlns="http://www.w3.org/2000/svg"
                    width="26" height="26" fill="currentColor" class="bi bi-send-fill" viewBox="0 0 16 16">
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                  </svg>
                  <span className="ml-1" style={{ fontWeight: 'bold' }}>Envoyer</span>
                </Button>
                <Button
                  className=" mt-3 ml-3 button-mobile "
                  size="small"
                  onClick={(e) => {
                    handleAnnulerCommende(e, ID_NOTE_FRAIS ? ID_NOTE_FRAIS : id)

                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                  </svg>
                  <span className="ml-1" style={{ fontWeight: 'bold' }}>Annuler</span>
                </Button>


              </>


            ) : null} */}


        </>

      </div>
    </>
  )
}





























