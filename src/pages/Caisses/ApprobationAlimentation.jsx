
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
import entete from "../../../public/images/nodebu.png";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";
import filligramme from "../../../public/images/filigrammeNodebu.png"
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const initialForm = {


};
export default function ApprobationAlimentation() {
    const dispacth = useDispatch();
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const idrls = decodeId(id)
    const [pdfUrl, setPdfUrl] = useState(null);
    const { ID_ALIMENTATION: encodedStr } = useParams();
    const ID_ALIMENTATION = decodeId(encodedStr)
    const [Alimentation, setAlimentation] = useState([]);
    const [data, setData] = useState(null);
    const user = useSelector(userSelector)
    const [selectAccessoire_stock, setSelectAccessoire_stock] = useState([]);
    const [selectAccessoire_stockEdit, setSelectAccessoire_stockEdit] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState([]); // ✅ Bon
    const [selectAll, setSelectAll] = useState(false);
    const [fournisseurs, setFournisseurs] = useState([]);
    const [amortissements, setAmortissements] = useState([]);
    const [totalRecords, setTotalRecords] = useState(1);
    const [total, setTotal] = useState(0);
    const [modes, setModes] = useState([])
    const IsAdmin = user.ID_PROFIL === PROFILS.ADMIN
    
    const [Statut, setStatut] = useState(null);
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
    const [approuveTermine, setApprouveTermine] = useState(false);

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

    useEffect(() => {
        document.title = "Détail crédit"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'Alimentation',
                name: 'Alimentation'
            },
            {
                path: 'Alimentation',
                name: 'Détail Alimentation'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);

    // liste deroulante des types operations
    const fetchOperation = useCallback(async () => {
        try {
            const res = await fetchApi(`/cotisation/types_operations_comptables/fetchtypeoperation?rows=1000000&`);
            // Filtrer uniquement "Octroi d’un crédit bancaire" et "Octroi d’un crédit en espèce"
            const filtered = res.result.data.filter((tyop) =>
                tyop.NOM_OPERATION === "Octroi d'un crédit (Bancaire)" ||
                tyop.NOM_OPERATION === "Octroi d'un crédit en espèce"
            );
            // Mapper les données filtrées
            setTypeOperation(
                filtered.map((tyop) => ({
                    name: tyop.NOM_OPERATION,
                    code: tyop.ID_TYPES_OPERATIONS,
                }))
            );
            setCodes(res); // Tu peux aussi filtrer ici si nécessaire
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchOperation();
    }, []);




    // Liste déroulante des accessoires requisitionnes qu'on peut commande
    const handleProductChange = (e) => {
        setSelectedProduct(e.value);
        const product = e.value ? selectAccessoire_stock.find(prod => prod.code === e.value.code) : null;
        setSelectedPrixUnitaire(product ? product.prix_achat : '');
        setSelectedQuantite(product ? product.quantite : '');
        setSelectedPrixVenteUnitaire(product ? product.prixvente : '');
    };








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
            const updatedFournisseurs = res.result.data.map((catg) => ({
                name: catg.NOM,
                code: catg.MEMBRE_ID,
            }));
            setFournisseurs(updatedFournisseurs);
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
        // console.log({ montantTotalCompteInterne });
        // console.log({ montantDemande });
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

    const handleApprouver = (e) => {
        Approuvecredit(e, ID_ALIMENTATION ?? ID_ALIMENTATION);
        setApprouveTermine(true); // ⛔️ Masque les boutons
    };

    const ApprouvecreditItems = async (id) => {
        try {
            const res = await fetchApi(`/Caisses/Alimentation/Valide/${id}`, {
                method: "get",
            });


            dispacth(
                setToastAction({
                    severity: "success",
                    summary: "Terminer la validation avec succès ",
                    detail: "La validation a bien été terminee succès",
                    life: 3000,
                })
            );
            FetchListeAlimentation()

        } catch (error) {
            console.log(error);
            if (error.httpStatus === "BAD_REQUEST") {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de la validation de l'alimentation",
                        detail: 'validation Incorrecte car le montant est unsiffisant ou Caisse est Inactif.',

                        life: 5000,
                    })
                )

                await wait(500);
                const header = document.querySelector("header");
                const nav = document.querySelector("nav");
                const firstErrorElement = document.querySelector(".p-invalid");
                const mainContent = document.querySelector(".main_content");
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
            }
            else {

                dispacth(
                    setToastAction({
                        severity: "error",
                        summary: "Erreur du système",
                        detail: "Erreur du système, réessayez plus tard",
                        life: 3000,
                    })
                );
            }
        }
    };
    //api d'approbation credit

    // fonction pour valider crédit
    const handleValider = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();
        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Valider le crédit",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mt-5">
                        Voulez-vous vraiment valider le crédit ?
                    </div>
                </div>
            ),

            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                handleValiderItems(itemsIds);
            },
        });
    };
    const handleValiderItems = async (id) => {
        const operation = data.STATUT?.code;
        //  Vérification : champ obligatoire
        if (!operation) {
            dispacth(setToastAction({
                severity: "warn",
                summary: "Type d'opération manquant",
                detail: "Veuillez sélectionner le type d'opération avant de valider.",
                life: 3000,
            }));
            return; // Arrêter l'exécution ici
        }
        // console.log(operation, 'TYPE_OPERATION_ID envoyé');

        try {
            const res = await fetchApi(`/credits/credits/validerCredit/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    TYPE_OPERATION_ID: operation,
                }),
            });

            setModes(prev => ({
                ...prev,
                TYPE_OPERATION_ID: operation,
            }));

            dispacth(setToastAction({
                severity: "success",
                summary: 'Crédit validé',
                detail: "La validation du crédit a bien été faite avec succès",
                life: 3000,
            }));

            FindOneCreidit();
        } catch (error) {
            console.error(error);
            dispacth(setToastAction({
                severity: "error",
                summary: "Erreur du système",
                detail: "Erreur du système, réessayez plus tard",
                life: 3000,
            }));
        }
    };
    const handleAnnulerAlimentation = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();

        let motif = ""; // variable pour stocker le texte du textarea

        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Annuler Alimentation d'un caisse",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mb-3">
                        Veuillez saisir le motif d'annulation :
                    </div>
                    <textarea
                        className="p-inputtext p-component"
                        style={{ width: '100%', minHeight: '80px' }}
                        onChange={(e) => {
                            motif = e.target.value;
                        }}
                    />
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                if (!motif.trim()) {
                    dispacth(
                        setToastAction({
                            severity: "warn",
                            summary: "Erreur lors d'annulation",
                            detail: "Le motif d'annulation est obligatoire",
                            life: 3000,
                        })
                    );
                    return;
                }
                handleAnnulerItems(itemsIds, motif);
            },
        });
    }

    const handleAnnulerItems = async (id) => {
        try {
            const res = await fetchApi(`/Caisses/Alimentation/annulationAlimentation/${id}`, {
                method: "post",
            });
            dispacth(
                setToastAction({
                    severity: "success",
                    summary: 'Annuler du crédit ',
                    detail: "L'annulation du crédit a bien été fait succès",
                    life: 3000,
                })
            );
            FetchListeAlimentation()


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
    }


    const FetchListeAlimentation = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/Caisses/Alimentation/Find/${ID_ALIMENTATION}?`;
            var url = baseurl
            const res = await fetchApi(url);
            console.log("Résultat brut:", res?.result?.STATUT);
            setStatut(res?.result?.STATUT);


            setData(res.result);
            //setTotalRecords(res.result.totalRecords);
            setAlimentation(res.result ? [res.result] : []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState,
        // dates, ID_INIT, 
        // comptesComptables

    ]);

    useEffect(() => {
        FetchListeAlimentation();
    }, [lazyState,


    ]);




    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100 w-100" id="loadingmobile">
                <div className="spinner-border" role="status" />
            </div>
        );
    }




    return (
        <>
            {isSubmitting && <Loading />}

            <div className="px-4 py-3 main_content bg-white has_footer">
                {pdfUrl ? (
                    <>
                        <div className="mt-4">
                            <h1 className="mb-3">Liste des echeances:</h1>
                            <iframe
                                src={pdfUrl}
                                width="100%"
                                height="800px"
                                style={{ border: "1px solid #ccc" }}
                                title="Facture PDF"
                            />
                        </div>

                        <div className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white" style={{ position: "absolute", bottom: 0, right: 0 }}>
                            <Button
                                className="mt-3 ml-3 button-mobile"
                                size="small"
                                type="button"
                                onClick={() => {
                                    URL.revokeObjectURL(pdfUrl);
                                    setPdfUrl(null);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                </svg>
                                <span className="ml-1" style={{ fontWeight: 'bold' }}>Fermer PDF</span>
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <div className="row">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="card is-mobile d-flex round-indicator hide-on-mobile" style={{ padding: 0 }}>
                                        <Image
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
                                onClick={() => navigate("/Alimentation")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-code" viewBox="0 0 16 16">
                                    <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z" />
                                </svg>
                            </Button>
                        </div>

                        {/* Statut section */}
                        <div className="col-sm ml-4" id="no-margin-left">
                            <div className="row mt-4">
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    {modes?.statutscre && (
                                        <div className="d-flex align-items-center ">
                                            <label className="label ms-0 mr-4">Statut :</label>
                                            <div
                                                className="d-flex align-items-center py-1 ms-4 px-2 rounded text-center w-max"
                                                style={{
                                                    backgroundColor: statutCreditsColor(modes.statutscre?.ID_STATUTS_CREDIT).backgroundColor,
                                                    color: statutCreditsColor(modes.statutscre?.ID_STATUTS_CREDIT).textColor,
                                                }}
                                            >
                                                <span
                                                    className="mb-1"
                                                    dangerouslySetInnerHTML={{
                                                        __html: statutCreditsColor(modes.statutscre?.ID_STATUTS_CREDIT).icon,
                                                    }}
                                                />
                                                <span className="ml-1" style={{ fontSize: 13 }}>
                                                    {modes.statutscre.DESCRIPTION || "-"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="rounded my-2 pr-1 bg-white ms-2">
                            <h6 className="ms-2">Alimentation</h6>
                            <DataTable
                                value={Alimentation}
                                editMode="row"
                                size="small"
                                dataKey="ID_ALIMENTATION"
                                //selection={selectedItems}
                                // onSelectionChange={onSelectionChange}
                                //selectAll={selectAll}
                                //onSelectAllChange={onSelectAllChange}
                                emptyMessage="Aucun élément trouvé"
                                resizableColumns
                            >
                                <Column
                                    field="NOM_AGENCE"
                                    frozen
                                    header="Montant"
                                    sortable
                                    body={(item) => {
                                        return (
                                            <span>
                                                {item?.MONTANT}


                                            </span>

                                        );
                                    }}
                                />

                                <Column
                                    field="TYPE_ALIMENTATION"
                                    header="Type alimentation"
                                    sortable
                                    body={(item) => {
                                        const type = parseInt((item?.TYPE_ALIMENTATION ?? "").toString().trim());

                                        // Mapping du type d’alimentation
                                        const typeMap = {
                                            0: { label: "Alimentation" },
                                            1: { label: "Remise" },
                                        };

                                        const info = typeMap[type] || { label: "Inconnu" };

                                        return (
                                            <span>{info.label}</span>
                                        );
                                    }}
                                />

                                <Column
                                    field="NOM_AGENCE"
                                    frozen
                                    header="Motif"
                                    sortable
                                    body={(item) => {
                                        return (
                                            <span>
                                                {item?.MOTIF}


                                            </span>

                                        );
                                    }}
                                />





                            </DataTable>
                        </div>



                        {IsAdmin?

                            <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">

                                {Statut === 0 || Statut === 2 ? null : (

                                    <Button
                                        label="Valider"
                                        type="submit"
                                        className="mt-3 ml-3"
                                        size="small"
                                        onClick={(e) => handleApprouver(e, ID_ALIMENTATION ?? ID_ALIMENTATION)}
                                    />

                                )}

                                {Statut === 2 || Statut === 0 ? null : (
                                    <>

                                        <Button
                                            label="Annuler"
                                            className="mt-3 ml-3 button-mobile"
                                            size="small"
                                            onClick={(e) => handleAnnulerAlimentation(e, ID_ALIMENTATION ?? ID_ALIMENTATION)}
                                        />
                                    </>)}


                            </div>
                            : null

                        }




                    </>
                )}
            </div>
        </>
    )
}