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
import venteMed from '../../../public/images/nodebu.jpg'
import { InputTextarea } from "primereact/inputtextarea";
import statutVenteColor from "../../helpers/statutVenteColor";
import STATUT_VENTE from "../../constants/STATUT_VENTE";
import { decodeId, encodeId } from "../../utils/IdEncryption";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import entete from "../../../public/images/nodebu.png";
import piedFact from "../../../public/images/footer.jpg";
import { Tooltip } from 'primereact/tooltip';
import statutDepenseColor from "../../helpers/statutDepenseColor";
import STATUT_DEPENSE from "../../constants/STATUT_DEPENSE";
import { FileUpload } from "primereact/fileupload";
import PROFILS from "../../constants/PROFILS";
import { userSelector } from "../../store/selectors/userSelector";
import { error } from "highcharts";
const initialForm = {
  CATEGORIE_ID: "",
  DESCRIPTION: "",
  MONTANT: "",
  // JUSTIFICATIF: "",
  REFERENCE_FICHE_DEPENSE: ""
};
export default function Fiche_depense_Details_com_page() {
  const dispacth = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const Idrls = decodeId(id);
  const { ID_FICHE_DEPENSES: encodedStr } = useParams();
  const ID_FICHE_DEPENSES = decodeId(encodedStr)
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
  const [modes, setModes] = useState([])
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
  const [Reference, setReference] = useState();
  const [loading, setLoading] = useState(true);
  const [ldetails, setLdetails] = useState([])
  const [pdfUrl, setPdfUrl] = useState(null);
  const [MontantCompteInterne, setMontantCompteInterne] = useState(0);
  const [MontantTOtalBancaire, setMontantTOtalBancaire] = useState(0);
  const [MontantTOtalCaisse, setMontantTOtalCaisse] = useState(0);
  const [MontantDemande, setMontantDemande] = useState(0);
  const [categorie, setCategorie] = useState([]);
  const [isApproved, setIsApproved] = useState(true);
  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle({ ...data, selectedProduct, selectReduction },
    {
      // CATEGORIE_ID: {
      //   required: true,
      // },
      DESCRIPTION: {
        required: false,
      },
      // JUSTIFICATIF: {
      //   // required: true,
      //   image: 4000000
      // },
      MONTANT: {
        required: true,
        alpha: true,
        decimal: true
      },
      REFERENCE_FICHE_DEPENSE: {
        required: false
      },
    },
    {
      CATEGORIE_ID: {
        required: "Ce champ est obligatoire",
      },
      // DESCRIPTION: {
      //   required: "Ce champ est obligatoire",
      // },
      // // JUSTIFICATIF: {
      //   // required: "Ce champ est obligatoire",
      //   image: "L'image ne doit pas depasser 4Mo "
      // },

      MONTANT: {
        required: "Ce champ est obligatoire",
        alpha: "Le montant n'est pas valide",
        decimal: "Le montant doit etre un nombre réel",
      },

      REFERENCE_FICHE_DEPENSE: {
        required: "Ce champ est obligatoire",
      },

    },

  );
  //   // Logique pour approuver ou annuler
  const handleToggleCancellation = (e) => {
    e.preventDefault();
    handleAnnulation(e, ID_FICHE_DEPENSES ? ID_FICHE_DEPENSES : id);
  };
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("CATEGORIE_ID", data.CATEGORIE_ID.code);
        form.append("DESCRIPTION", data.DESCRIPTION || "-");
        form.append("MONTANT", data.MONTANT);
        form.append("REFERENCE_FICHE_DEPENSE", Reference);

        const res = await fetchApi(`/depenses/fiche_depenses/addproduitInV`, {
          method: "POST",
          body: form,
        });
        dispacth(
          setToastAction({
            severity: "success",
            summary: "Dépense ajoutée",
            detail: "Dépense  a bien été  ajoutée dans une facture ",
            life: 3000,
          })
        );
        FindListeDetailsCommdeMp()
        findonecommandClient();

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
            severity: "warn",
            summary: "Non trouve quantite",
            detail: "Aucune prix definit pour une quantité",
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
  //liste deroulante des categories
  const fetchCategorieDepense = useCallback(async () => {
    try {
      const baseurl = `/depenses/categorieDepense/fetch?rows=100000000&`;
      var url = baseurl;
      const res = await fetchApi(url);
      const updatedRef = res.result.data.map((clt) => ({
        name: `${clt.NOM_DEPENSES}`,
        code: clt.ID_CATEGORIES_DEPENSES,
      }));
      setCategorie(updatedRef);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchCategorieDepense();
  }, []);



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


  const findonecommandClient = async () => {
    try {
      let res;
      if (id) {

        res = await fetchApi(`/depenses/fiche_depenses/findFicheDep/${id}`);
      } else {
        res = await fetchApi(`/depenses/fiche_depenses/findFicheDep/${ID_FICHE_DEPENSES}`);
      }
      const cmde = res.result;
      setReference(cmde?.REFERENCE_FICHE_DEPENSE)
      setModes(cmde);
      setData({
        REFERENCE_FICHE_DEPENSE: cmde.REFERENCE_FICHE_DEPENSE,
        DATE_DEPENSE: new Date(cmde.DATE_DEPENSE),
        MODE_PAIEMENT: cmde.MODE_PAIEMENT == 0 ? modePaiement[0] : cmde.MODE_PAIEMENT == 1 ? modePaiement[1] : cmde.MODE_PAIEMENT == 2 ? modePaiement[2] : modePaiement[2]



      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingModes(false);
    }
  };
  useEffect(() => {
    findonecommandClient();
  }, []);

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
      setModes(updatedModes);
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
      setModes(updatedModes);
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
  const FindOneCreidit = useCallback(async () => {
    try {
      const baseurl = `/depenses/fiche_depenses/findFicheDep/${ID_FICHE_DEPENSES}`;
      var url = await fetchApi(baseurl);
      const res = url
      console.log({ res });

      const cmde = res.result;
      const MontantDemande = cmde.MONTANT_TOTAL
      //console.log({MontantDemande},'MontantDemandeMontantDemandeMontantDemandeMontantDemandeMontantDemandeMontantDemande');
      setMontantDemande(MontantDemande)
      setModes(cmde);
      const creditId = cmde.ID_OCTROI_CREDIT;
      //setcreditId(creditId); // Mettre à jour l'état


      setData({

      });
    } catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    FindOneCreidit()
  }, [])

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
      const Montant = res.result
      const MontantTotal = Montant.MONTANT_TOTAL


      setMontantDemande(MontantTotal)
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
  const fetchMontantTotalCredits = useCallback(async () => {
    try {
      setLoading(true);

      let url = "/rapport/findCoutRevenuCredits/fetch?";


      const res = await fetchApi(url);
      console.log(res);


      // Mise à jour selon la structure du backend corrigé

      setMontantCompteInterne(Number(res.result?.MontantTotalCompteInterne))
      setMontantTOtalCaisse(Number(res.result?.MontantTOtalCraiditDebitCaisse))
      setMontantTOtalBancaire(Number(res.result?.MontantTOtalCraiditDebitBancaire))

    } catch (error) {
      console.error("Erreur lors de la récupération des crédits :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMontantTotalCredits();
  }, []);


  const handleApprouve = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    const montantTotalCompteInterne = parseFloat(MontantCompteInterne);
    const Caisse = parseFloat(MontantTOtalCaisse);
    const Bank = parseFloat(MontantTOtalBancaire);

    
    const montantDemande = parseFloat(MontantDemande); // Assure-toi que c'est un nombre
    if (montantTotalCompteInterne < montantDemande || montantTotalCompteInterne <= 0) {

      dispacth(
        setToastAction({
          severity: "warn",
          summary: "Montant insuffisant",
          detail: `Solde insuffisant.`,
          life: 3000,
        })
      );
      return; // 👈 Empêche la suite si le montant est insuffisant
    }

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

  const exportPdf = () => {
    const pageWidth = 210;
    const pageHeight = 297;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: 'a4' });


    // Ajouter l'image importée
    doc.addImage(entete, "JPEG", 0, 2, 70, 30);

    // Titre sous l'image
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    const numeroVente = modes.REFERENCE_FICHE_DEPENSE;
    doc.text(`Dépense numéro  : ${numeroVente}`, 125, 20, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const columns = [
      { title: "#", dataKey: "NUMERO" },
      { title: "Nom de dépense", dataKey: "NOM_DEPENSES" },
      { title: "Montant", dataKey: "MONTANT" },
    ];

    // Génération du tableau PDF avec fusion de cellules et centrage
    const montatTotal = modes.MONTANT_TOTAL ? parseFloat(modes.MONTANT_TOTAL) : 0;

    doc.autoTable({
      startY: 45,
      head: [columns.map(col => col.title)],
      body: [
        ...ldetails.map((item, index) => [
          index + 1,
          item.categorie?.NOM_DEPENSES ? item.categorie?.NOM_DEPENSES : "-",
          item.MONTANT ? `${parseFloat(item.MONTANT).toLocaleString('fr-FR').replace(/\s/g, ' ')} Fbu` : "0 Fbu",
        ]),
        // Ajouter les lignes pour les totaux
        ["Total", "", `${montatTotal.toLocaleString('fr-FR').replace(/\s/g, ' ')} Fbu`,],
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
    const benef = modes.IS_BENEFICIAIRE == 1 ? (`${modes.empl.NOM} ${modes.empl.PRENOM}`) : (`${modes.fourn.NOM_COMPLET}`)

    const effectuéPar = `Effectué par : ${modes.utilisateur.NOM} ${modes.utilisateur.PRENOM}`;
    const approuvéPar = `Approuvé par : ${modes.validateur.NOM} ${modes.validateur.PRENOM}`;

    // Positionnement du texte
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Bénéficiaire : ${benef}`, 10, footerYPosition - 30);
    doc.text(effectuéPar, 10, footerYPosition - 10);
    doc.text(approuvéPar, 125, footerYPosition - 10,);

    // Ajouter l'image du pied de page
    // doc.addImage(piedFact, "JPEG", 0, footerYPosition + 5, pageWidth, 15);


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


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100" id="loadingmobile">
        <div className="spinner-border" role="status" />
      </div>
    );
  }


  return (
    <>
      {/* <ConfirmDialog /> */}
      {isSubmitting ? <Loading /> : null}
      <Dialog header="Détails" visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }}>
        <p className="m-0">
          {modes.COMMANTAIRE}
        </p>
      </Dialog>
      <div className="px-4 py-3 main_content bg-white has_footer">

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

            <div className="row">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className=" row ">
                  <div className="d-flex align-items-center justify-content-between ">
                    <div className="card  is-mobile d-flex round-indicator hide-on-mobile " style={{ padding: 0 }} >
                      <Image
                        src={venteMed}
                        alt="Image"
                        imageClassName="rounded-4 object-fit-cover hide-on-mobile"
                        imageStyle={{ width: "150px", height: "150px" }}

                      />
                    </div>


                    <div className=" ml-2 mb-5 " id="no-margin-left">
                      <div className="row ">
                        <div className="d-flex ">
                          <label className="label mb-1 ">Réf.Dépense</label>
                          <div className=""></div>
                          <span className="font-bold px-3">: {modes?.REFERENCE_FICHE_DEPENSE ? modes?.REFERENCE_FICHE_DEPENSE : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="row">
                        <div className="d-flex ">
                          <label className="label mb-1">Bénéficiaire </label>
                          <div className=""> </div>
                          {modes.IS_BENEFICIAIRE == 0 ? (
                            <span className="font-bold px-3 ml-2">: {modes?.fourn?.NOM_COMPLET ? modes?.fourn?.NOM_COMPLET : '-'}
                            </span>
                          ) : (
                            <span className="font-bold px-3 ml-2">: {modes?.empl?.NOM ? `${modes?.empl?.NOM} ${modes?.empl?.PRENOM}` : '-'}
                            </span>
                          )}

                        </div>
                      </div>
                    </div>


                  </div>
                </div>

                <Button
                  className=" mt-3 ml-3 button-mobile  px-2 py-1 "
                  label="Retour"
                  size="small"
                  onClick={() => {
                    navigate("/fiche_depenses");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-code" viewBox="0 0 16 16">
                    <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z" />
                  </svg>
                </Button>
              </div>
            </div>


            <div className="row">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div></div>

                <div
                  className="d-flex align-items-center py-1 px-2 rounded  text-center w-max"
                  style={{
                    backgroundColor: statutDepenseColor(
                      modes.STATUT

                    ).backgroundColor,
                    color: statutDepenseColor(
                      modes.STATUT
                    ).textColor,
                  }}
                >
                  <span
                    className="mb-1"
                    dangerouslySetInnerHTML={{
                      __html: statutDepenseColor(
                        modes.STATUT
                      ).icon,
                    }}
                  />
                  <span className="ml-1" style={{ fontSize: 13 }}>
                    {modes.STATUT === STATUT_DEPENSE.EN_BROUILLON ? "En Brouillon" :
                      modes.STATUT === STATUT_DEPENSE.EN_ATTENTE_APPROBATION ? "En attente d'approbation"
                        : modes.STATUT === STATUT_DEPENSE.APPROUVE ? "Approuvé" :
                          modes.STATUT === STATUT_DEPENSE.ANNULE ? "Annule" : "Payé"
                    }
                  </span>
                </div>

              </div>
            </div>
            <div className="row ">

              <div className="column w-50 mt-3">
                <div className="form-group col-sm">
                  <div className="row">
                    <div className="col-md-3">
                      <label className="label mb-1"> Agent paiement</label>
                    </div>
                    <div className="col-sm">: <span className="font-bold">

                      {modes.utilisateur ? (
                        <span>
                          {modes.utilisateur.NOM ? modes.utilisateur.NOM : '-'} {modes.utilisateur.PRENOM ? modes.utilisateur.PRENOM : '-'}
                        </span>
                      ) : '-'}
                    </span>
                    </div>

                  </div>
                </div>
                <hr className="mt-1" />
                <div className="form-group col-sm">
                  <div className="row">
                    <div className="col-md-3">
                      <label className="label mb-1"> Date </label>
                    </div>
                    <div className="col-sm">:

                      {iconVisibledate && (
                        <>

                          <span className="font-bold"> {moment(modes?.DATE_DEPENSE).format("DD/MM/YYYY")}</span>
                          {modes?.STATUT == STATUT_DEPENSE.EN_BROUILLON ?
                            <>
                              <Tooltip target=".editer" />
                              <span
                                data-pr-tooltip="Editer"
                                className="cursor-pointer editer ml-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  fill="currentColor" class="bi bi-pen"
                                  viewBox="0 0 16 16"
                                  className="cursor-pointer"
                                  onClick={toggleDropdowndate}
                                >
                                  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                                </svg>

                              </span>
                            </>
                            : ''}

                        </>
                      )}

                      <span className="ml-2">
                        {dropdownVisibledate && (
                          <>
                            <Calendar
                              value={data.DATE_DEPENSE}
                              name="DATE_DEPENSE"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                setValue("DATE_DEPENSE", e.value);
                                setError("DATE_DEPENSE", {});
                              }}
                              // minDate={new Date()}
                              placeholder="Choisir la date"
                              // inputClassName="w-150"
                              className="p-inputtext-sm md:w-15rem w-90"

                            />

                            <span >
                              <Tooltip target=".modifier" />
                              <Tooltip target=".annuler" />
                              <span
                                data-pr-tooltip="Modifier"
                                className="cursor-pointer modifier"
                                onClick={modifierDate}
                              >

                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                </svg>

                              </span>
                              <span
                                data-pr-tooltip="Annuler"
                                className="cursor-pointer annuler ml-1"
                                onClick={annulerDate}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" width="25" height="25" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                </svg>
                              </span>

                            </span>
                          </>

                        )}
                      </span>

                    </div>

                  </div>
                </div>
                <hr className={dropdownVisibledate ? "mt-3" : "mt-1"} />
                <div className="form-group col-sm">
                  <div className="row">
                    <div className="col-md-3">
                      <label className="label mb-1"> mode de paiement </label>
                    </div>
                    <div className="col-sm">:
                      {iconVisible && (
                        <>
                          <span className="font-bold"> {modes?.MODE_PAIEMENT == 0 ? 'En espèce' : modes?.MODE_PAIEMENT == 1 ? 'Bancaire' : 'Virement'}</span>
                          {modes?.STATUT == STATUT_DEPENSE.EN_BROUILLON ?
                            <>
                              <Tooltip target=".editer" />
                              <span
                                data-pr-tooltip="Editer"
                                className="cursor-pointer editer ml-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  fill="currentColor" class="bi bi-pen"
                                  viewBox="0 0 16 16"
                                  className="cursor-pointer"
                                  onClick={toggleDropdown}
                                >
                                  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                                </svg>

                              </span>
                            </>
                            : ''}

                        </>
                      )}

                      <span className="ml-2">
                        {dropdownVisible && (
                          <>
                            <Dropdown
                              value={data.MODE_PAIEMENT}
                              options={modePaiement}
                              onChange={(e) => setValue("MODE_PAIEMENT", e.value)}
                              optionLabel="name"
                              id="MODE_PAIEMENT"
                              filter
                              filterBy="name"
                              placeholder="Sélectionner "
                              emptyFilterMessage="Aucun element trouvee"
                              emptyMessage="Aucun element trouvee"
                              name="MODE_PAIEMENT"
                              onHide={() => {
                                checkFieldData({ target: { name: "MODE_PAIEMENT" } });
                              }}
                              className="p-inputtext-sm md:w-15rem w-90"
                              showClear
                            />
                            <span >
                              <Tooltip target=".modifier" />
                              <Tooltip target=".annuler" />
                              <span
                                data-pr-tooltip="Modifier"
                                className="cursor-pointer modifier ml-1"
                                onClick={modifierTypepaiement}
                              >

                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                </svg>

                              </span>
                              <span
                                data-pr-tooltip="Annuler"
                                className="cursor-pointer annuler ml-1"
                                onClick={annuler}

                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" width="25" height="25" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                </svg>
                              </span>
                            </span>
                          </>

                        )}

                      </span>

                    </div>

                  </div>
                </div>
                <hr className={dropdownVisible ? "mt-3" : "mt-1"} />


              </div>
              <div className="column w-50 mt-3 ">

                <div className="form-group col-sm">
                  <div className="row">
                    <div className="col-md-4">
                      <label className="label mb-1"> Montant Total </label>
                    </div>
                    <div className="col-sm">: <span className="font-bold">
                      {modes?.MONTANT_TOTAL ? parseFloat(modes?.MONTANT_TOTAL).toLocaleString('fr-FR') : 0} Fbu
                    </span>
                    </div>
                  </div>
                </div>
                <hr className="mt-1" />
                {modes.STATUT === STATUT_DEPENSE.APPROUVE ? (
                  <div>
                    {/* <hr className="mt-1" /> */}
                    <div className="form-group col-sm">
                      <div className="row">
                        <div className="col-md-3">
                          <label className="label mb-1"> Approuvé par </label>
                        </div>
                        <div className="col-sm">: <span className="font-bold">

                          {modes.validateur ? (
                            <span>
                              {modes.validateur.NOM ? modes.validateur.NOM : '-'} {modes.validateur.PRENOM ? modes.validateur.PRENOM : '-'}
                            </span>
                          ) : '-'}
                        </span>
                        </div>

                      </div>
                    </div>
                    <hr className="mt-1" />

                  </div>
                ) : null}

              </div>



            </div>

            <div className=" rounded my-2 pr-1 bg-white">
              <h6>Détails dépense</h6>

              <DataTable
                value={ldetails}
                editMode="row"
                size="small"
                dataKey="ID_DETAILS_DEPENSES"
                onRowEditComplete={onRowEditComplete}
                selection={selectedItems}
                onSelectionChange={onSelectionChange}
                selectAll={selectAll}
                style={{ padding: 2, paddingRight: 0 }}
                onSelectAllChange={onSelectAllChange}
                emptyMessage="Aucun élément trouvé"
                resizableColumns
              >
                <Column
                  field=""
                  header="#"
                  headerStyle={{ fontSize: 14 }}
                  body={(rowData, rowIndex) => {
                    const index = ldetails.indexOf(rowData) + 1;
                    return <span>{index}</span>;
                  }}
                />


                <Column
                  field="CATEGORIE_ID"
                  header="Nom de dépense"
                  editor={(options) => categoriesEditor(options)}
                  headerStyle={{ fontSize: 14 }}
                  body={item => (
                    <span>{item.categorie?.NOM_DEPENSES}</span>
                  )}
                />

                <Column
                  field="MONTANT"
                  header="Montant"
                  editor={(options) => montantEditor(options)}
                  headerStyle={{ fontSize: 14 }}
                  body={item => {
                    return (
                      item.MONTANT !== 0 ? (
                        <span>
                          {item?.MONTANT ? (parseFloat(item?.MONTANT)).toLocaleString('fr')
                            : 0} </span>
                      ) : ('-')

                    )
                  }
                  }
                />
                <Column
                  field="DESCRIPTION"
                  header="Description"
                  editor={(options) => descriptionEditor(options)}
                  headerStyle={{ fontSize: 14 }}
                  body={item => {
                    return (
                      <span>
                        {item.DESCRIPTION !== "NULL" && item.DESCRIPTION ? item.DESCRIPTION : "-"}
                      </span>
                    );
                  }} />


                <Column
                  field="JUSTIFICATIF"
                  header="Justificatif"
                  frozen
                  editor={(options) => ImageEditor(options)}
                  //sortable
                  body={(item) => {
                    const css = `
                            .round-indicator .p-image-preview-indicator {
                            border-radius: 50%
                            }`;
                    return (
                      <>
                        <div className="d-flex round-indicator">
                          <Image
                            src={item.JUSTIFICATIF}
                            alt="Image"
                            className="rounded-5"
                            imageClassName="rounded-5 object-fit-cover"
                            imageStyle={{ width: "50px", height: "50px" }}
                            style={{ width: "50px", height: "50px" }}
                            preview
                          />

                        </div>
                        <style>{css}</style>
                      </>
                    );
                  }}
                />

                {modes.STATUT === STATUT_DEPENSE.EN_BROUILLON || modes.STATUT === STATUT_DEPENSE.APPROUVE ? (

                  <Column
                    header="Actions"
                    rowEditor
                    headerStyle={{ width: "1%", minWidth: "8rem" }}
                    bodyStyle={{ textAlign: "center" }}
                    body={(rowData, options) => (
                      <>

                        {options.rowEditor?.editing ? (
                          <>

                            <Button

                              style={{ backgroundColor: 'transparent', border: 'none', padding: 5 }}
                              onClick={(e) =>
                                options.rowEditor?.onSaveClick &&
                                options.rowEditor?.onSaveClick(e)
                              }

                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-floppy" viewBox="0 0 16 16">
                                <path d="M11 2H9v3h2z" />
                                <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
                              </svg>
                            </Button>


                            <Button

                              style={{ backgroundColor: 'transparent', border: 'none', padding: 5 }}
                              onClick={(e) =>
                                options.rowEditor?.onCancelClick &&
                                options.rowEditor?.onCancelClick(e)
                              }
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                              </svg>
                            </Button>

                          </>
                        ) : (

                          <>
                            <Button

                              style={{ backgroundColor: 'transparent', border: 'none', padding: 5 }}
                              onClick={(e) =>
                                options.rowEditor?.onInitClick &&
                                options.rowEditor?.onInitClick(e)
                              }

                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-pen" viewBox="0 0 16 16">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                              </svg>
                            </Button>
                            {modes.STATUT === STATUT_DEPENSE.EN_BROUILLON ? (
                              <>
                                <Button
                                  style={{ backgroundColor: 'transparent', border: 'none', padding: 5 }}
                                  onClick={(e) =>
                                    handleDeletePress(e,
                                      [rowData.ID_DETAILS_DEPENSES],
                                    )
                                  }
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash3" viewBox="0 0 16 16 ">
                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                  </svg>
                                </Button>
                              </>
                            ) : null}


                          </>
                        )}
                      </>
                    )}
                  />

                ) : modes.STATUT === STATUT_DEPENSE.APPROUVE || modes.STATUT === STATUT_DEPENSE.EN_BROUILLON ? (
                  <>
                    <Column
                      header="Actions"
                      rowEditor
                      headerStyle={{ width: "1%", minWidth: "8rem" }}
                      bodyStyle={{ textAlign: "center" }}
                      body={(rowData, options) => (
                        <>

                          {options.rowEditor?.editing ? (
                            <>

                              <Button

                                style={{ backgroundColor: 'transparent', border: 'none', padding: 5 }}
                                onClick={(e) =>
                                  options.rowEditor?.onSaveClick &&
                                  options.rowEditor?.onSaveClick(e)
                                }

                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-floppy" viewBox="0 0 16 16">
                                  <path d="M11 2H9v3h2z" />
                                  <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
                                </svg>
                              </Button>


                              <Button

                                style={{ backgroundColor: 'transparent', border: 'none', padding: 5 }}
                                onClick={(e) =>
                                  options.rowEditor?.onCancelClick &&
                                  options.rowEditor?.onCancelClick(e)
                                }
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-x-lg" viewBox="0 0 16 16">
                                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                </svg>
                              </Button>

                            </>
                          ) : (

                            <>
                              <Button

                                style={{ backgroundColor: 'transparent', border: 'none', padding: 5 }}
                                onClick={(e) =>
                                  options.rowEditor?.onInitClick &&
                                  options.rowEditor?.onInitClick(e)
                                }

                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-pen" viewBox="0 0 16 16">
                                  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                                </svg>
                              </Button>
                              {modes.STATUT === STATUT_DEPENSE.EN_BROUILLON ? (
                                <>
                                  <Button
                                    style={{ backgroundColor: 'transparent', border: 'none', padding: 5 }}
                                    onClick={(e) =>
                                      handleDeletePress(e,
                                        [rowData.ID_DETAILS_DEPENSES],
                                      )
                                    }
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash3" viewBox="0 0 16 16 ">
                                      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                    </svg>
                                  </Button>
                                </>
                              ) : null}


                            </>
                          )}
                        </>
                      )}
                    />
                  </>
                ) : null


                }

              </DataTable>


            </div>

            {modes.STATUT === STATUT_DEPENSE.EN_BROUILLON ? (
              <>
                <form className="form w-100  mt-5 mb-5" onSubmit={handleSubmit}>

                  <h6>Formulaire de détail dépense</h6>

                  <div className="form-group mt-5">
                    <div className="row">
                      {/* Réf. */}
                      <div className="form-group mt-5">
                        <div className="row">

                          {/* Réf. */}

                          <div className="col-sm col-sm-3 " style={{ display: "none" }}>
                            <label htmlFor="REFERENCE_FICHE_DEPENSE" className="label mb-0">
                              Réferance
                            </label>

                            <InputText
                              type="text"
                              placeholder="numero vente"
                              id="REFERENCE_FICHE_DEPENSE"
                              name="REFERENCE_FICHE_DEPENSE"
                              value={data.REFERENCE_FICHE_DEPENSE}
                              onChange={handleChange}
                              onBlur={checkFieldData}
                              readOnly
                              className={`w-100 ${hasError("NUMERO_CMD") ? "p-invalid" : ""}`}
                            />
                            <div className="invalid-feedback" style={{ minHeight: 21 }}>
                              {hasError("REFERENCE_FICHE_DEPENSE") ? getError("REFERENCE_FICHE_DEPENSE") : ""}
                            </div>
                          </div>

                          {/* Produits */}
                          <div className="col-sm " id="">
                            <label htmlFor="CATEGORIE_ID" className="label mb-0">
                              Nom de dépense
                            </label>
                            <Dropdown
                              value={data.CATEGORIE_ID}
                              options={categorie}
                              // onChange={handleClientChange}
                              onChange={(e) => setValue("CATEGORIE_ID", e.value)}
                              optionLabel="name"
                              id="CATEGORIE_ID"
                              filter
                              filterBy="name"
                              placeholder="Sélectionner la catégorie de dépense"
                              emptyFilterMessage="Aucun element trouvee"
                              emptyMessage="Aucun element trouvee"
                              name="CATEGORIE_ID"
                              onHide={() => {
                                checkFieldData({ target: { name: "CATEGORIE_ID" } });
                              }}
                              className={`w-100 ${hasError("CATEGORIE_ID") ? "p-invalid" : ""}`}
                              showClear
                            // emptyOption={newClientOption}
                            // itemTemplate={customOptionTemplate}
                            />
                            <div
                              className="invalid-feedback"
                              style={{ minHeight: 21, display: "block" }}
                            >
                              {hasError("CATEGORIE_ID") ? getError("CATEGORIE_ID") : ""}
                            </div>

                          </div>
                          {/* quantite disponible*/}
                          <div className="col-sm">
                            <label htmlFor="MONTANT" className="label mb-0">
                              Montant
                            </label>
                            <InputText
                              type="text"
                              placeholder="Ecrire le montant"
                              id="MONTANT"
                              name="MONTANT"
                              value={data.MONTANT}
                              onChange={handleChange}
                              onBlur={checkFieldData}
                              className={`w-100 ${hasError("MONTANT") ? "p-invalid" : ""}`}
                            />
                            <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                              {hasError("MONTANT") ? getError("MONTANT") : ""}
                            </div>
                          </div>
                        </div>
                        <div className="row mt-3">
                          <div className="col-sm">
                            <label htmlFor="DESCRIPTION" className="label mb-0">
                              Description
                            </label>
                            <InputTextarea
                              id="DESCRIPTION"
                              name="DESCRIPTION"
                              value={data.DESCRIPTION}
                              onChange={handleChange}
                              onBlur={checkFieldData}
                              className={`w-100 ${hasError("DESCRIPTION") ? "p-invalid" : ""}`}
                            />
                            <div className="invalid-feedback">
                              {hasError("DESCRIPTION") ? getError("DESCRIPTION") : ""}
                            </div>
                          </div>


                          {/* Bouton Ajouter */}
                          <div className="col-sm  mb-3">
                            <Button
                              label="Ajouter"
                              type="submit"
                              className="w-100 mt-4"
                              size="small"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </form>


              </>



            ) : null}







            {modes.STATUT === STATUT_DEPENSE.EN_BROUILLON ? (

              <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
                {ldetails.length > 0 ? (
                  <>

                    {
                      modes.STATUT === STATUT_DEPENSE.EN_BROUILLON ? (
                        <>
                          <Button
                            className=" mt-3 ml-3 button-mobile "
                            size="small"
                            type="submit"
                            onClick={(e) => {
                              handleDemandeApprouve(e, ID_FICHE_DEPENSES ? ID_FICHE_DEPENSES : id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
                              <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
                            </svg>
                            <span className="ml-1" style={{ fontWeight: 'bold' }}>Demande approbation</span>
                          </Button>

                          <Button
                            className=" mt-3 ml-3 button-mobile "
                            size="small"
                            type="submit"
                            onClick={(e) => {
                              handleAnnulation(e, ID_FICHE_DEPENSES ? ID_FICHE_DEPENSES : id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                            <span className="ml-1" style={{ fontWeight: 'bold' }}>Annuler</span>
                          </Button>


                        </>
                      ) : null
                    }
                  </>

                ) : (
                  <>
                    <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
                      <div className="mb-7">

                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : modes.STATUT === STATUT_DEPENSE.EN_ATTENTE_APPROBATION ? (
              <>


                {user.PROFIL?.ID_PROFIL == PROFILS.ADMIN || user.PROFIL?.ID_PROFIL == PROFILS.EMPLOYE ? (
                  <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">

                    <>
                      <Button
                        className=" mt-3 ml-3 button-mobile "
                        size="small"
                        type="submit"
                        onClick={(e) => {
                          handleApprouve(e, ID_FICHE_DEPENSES ? ID_FICHE_DEPENSES : id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-all" viewBox="0 0 16 16">
                          <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z" />
                        </svg>
                        <span className="ml-1" style={{ fontWeight: 'bold' }}>Approuvé</span>
                      </Button>
                    </>
                  </div>
                ) : null}

              </>
            ) : modes.STATUT === STATUT_DEPENSE.APPROUVE ? (
              <>
                <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">

                  <Button
                    className=" mt-3 ml-3 button-mobile "
                    size="small"
                    type="submit"
                    onClick={(e) => {
                      handleGenerateFacture(e, ID_FICHE_DEPENSES)

                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                      <path d="M9.293 0H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5.707L9.293 0zM5 1h4a1 1 0 0 1 1 1v3H5V1zm0 4h5v1H5V5zm0 2h5v1H5V7zm0 2h5v1H5v-1zm0 2h5v1H5v-1z" />
                    </svg>
                    <span className="ml-1" style={{ fontWeight: 'bold' }}>Générer PDF</span>
                  </Button>
                  <Button
                    className="mt-3 ml-3 button-mobile"
                    size="small"
                    type="button" // Changez à "button" pour éviter la soumission de formulaire
                    onClick={handleToggleCancellation}
                    style={{
                      border: '2px solid red',
                      borderRadius: '4px', // Rectangle arrondi
                      padding: '5px 10px',
                      display: 'flex',
                      alignItems: 'center'
                    }} // Bouton rectangulaire
                  >
                    <div
                      style={{
                        border: '2px solid red',
                        borderRadius: '50%',
                        width: '24px', // Cercle réduit
                        height: '24px', // Cercle réduit
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '8px' // Espacement entre le cercle et le texte
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12" // Taille réduite du symbole
                        height="12" // Taille réduite du symbole
                        fill="red" // Couleur rouge
                        className="bi bi-x"
                        viewBox="0 0 16 16"
                      >
                        <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 7.586l5.293-6.293a1 1 0 0 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z" />
                      </svg>
                    </div>
                    <span className="ml-1" style={{ fontWeight: 'bold' }}>Annuler</span>
                  </Button>


                </div>
              </>
            ) : modes.STATUT === STATUT_DEPENSE.PAYE ? (
              <>
                <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">

                  <Button
                    className=" mt-3 ml-3 button-mobile "
                    size="small"
                    type="submit"
                    onClick={(e) => {
                      handleGenerateFacture(e, ID_FICHE_DEPENSES)

                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                      <path d="M9.293 0H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5.707L9.293 0zM5 1h4a1 1 0 0 1 1 1v3H5V1zm0 4h5v1H5V5zm0 2h5v1H5V7zm0 2h5v1H5v-1zm0 2h5v1H5v-1z" />
                    </svg>
                    <span className="ml-1" style={{ fontWeight: 'bold' }}>Générer PDF</span>
                  </Button>
                </div>
              </>
            ) : (

              <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
                <div className="mb-7">

                </div>
              </div>
            )
            }

          </>
        )
        }
      </div >

    </>
  );
}


























