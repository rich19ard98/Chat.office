import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import entete from "../../../public/images/nodebu.png";
import { Calendar } from "primereact/calendar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import { userSelector } from "../../store/selectors/userSelector";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import jsPDF from "jspdf";
import { decodeId } from "../../utils/IdEncryption";
import { useParams } from "react-router-dom";
import "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import statutAmortissementsColor from "../../helpers/statutAmortissementsColor";
import PROFILS from "../../constants/PROFILS";
export default function AffichageResultats() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const user = useSelector(userSelector);
    const [Comptes, setComptes] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [activeButton, setActiveButton] = useState(1)
    const [afficheCotisation, setAfficheCotisation] = useState(1)
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [dates, setDates] = useState(null);
    const [selectedMembre, setSelectedMembre] = useState(null);
    const [membredata, setmembredata] = useState([]);
    const [profiledata, setProfiledata] = useState([])
    const [montant, setMontant] = useState(null)
    const [Resultats, setResultats] = useState(null)
    const { ID_RESULTAT: encodedId } = useParams();
    const ID_RESULTAT = decodeId(encodedId); // Décoder pour obtenir l'ID réel

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
            setSelectedItems(credits);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };
    const membresSelected = (membre) => {
        setSelectedMembre(membre);
    };

    const FetchResultatsapprouve = useCallback(async () => {
        try {
            var baseurl = `/Resultats/Resultats/fetch?`
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
            if (ID_RESULTAT) {
                url += `ID_RESULTAT=${ID_RESULTAT}&`;
            }
            const res = await fetchApi(url);

            setResultats(res.result.data)

        } catch (error) {
            console.error("Erreur lors de la récupération des comptes :", error);
        }
    }, []);

    useEffect(() => {
        FetchResultatsapprouve();
    }, [ID_RESULTAT]);


    //fonction pour lister les cotisation
    const fetchCotisation = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/comptecomptablemembres/Comptecomptablesmembbres/fetch?rows=100000000000000&`;

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
            if (dates) {
                const [startDate, endDate] = dates;
                if (startDate) {
                    url += `startDate=${startDate.toISOString()}&`;
                }
                if (endDate) {
                    url += `endDate=${endDate.toISOString()}&`;
                }
            }
            if (selectedMembre?.code) {
                url += `selectedMembre=${selectedMembre.code}&`;
            }

            const res = await fetchApi(url);

            setComptes(res.result.data);
            setTotalRecords(res.result.totalRecords);
            const total = res.result.data.reduce((acc, cur) => acc + Number(cur.MONTANT || 0), 0);
            setMontant(total)

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, selectedMembre]);

    useEffect(() => {
        fetchCotisation();
    }, [lazyState, selectedMembre]);

    useEffect(() => {
        document.title = "Compte"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'Comptes',
                name: 'Liste'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);
    /**
  * Permet Generer Pdf et excel
   * @param {express.Request} req 
  * @param {express.Response} res 
  * @author Richard <richardngendakumana10@gmail.com>
  * @date 02/07/2025
  */


    const fetchmembres = useCallback(async () => {
        try {
            var url = `/administration/utilisateurs/fetch?rows=10000&`
            if (profiledata) {
                url += `profil=2`;
            }
            const res = await fetchApi(url);

            setmembredata(
                res.result.data.map((util) => {
                    return {
                        name: `${util.membre.NOM} ${util.membre.PRENOM}`,
                        code: util.membre.ID_MEMBRES_MICROFINANCE,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchmembres();
    }, []);
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT

    const cotisationPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COTISATION)
    const cotisAcces = cotisationPermission && (cotisationPermission.CAN_READ || cotisationPermission.CAN_WRITE)
    if (!cotisAcces && !IsGerant && !IsAdminAjoin) {
        return <NotFound />
    }
    return (
        <>

            {globalLoading && <Loading />}

            <div className="px-4 py-3 main_content">
                {pdfUrl ? (
                    <>
                        <div className="mt-4">
                            <h1 className="mb-3">Listes Des Resultats :</h1>
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
                                type="submit"
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
                        <div className="d-flex align-items-center justify-content-between">
                            <h1 className="mb-3">Resultats</h1>

                        </div>
                        <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                            <div className="d-flex  align-items-center">

                            </div>

                        </div>
                        <div className="content">
                            <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
                                <DataTable
                                    lazy
                                    size={'small'}
                                    value={Resultats}
                                    // showGridlines
                                    tableStyle={{ minWidth: "50rem" }}
                                    className=""
                                    paginator
                                    rowsPerPageOptions={[5, 10, 25, 50, 100, 200, 500, 1000, 2000]}
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate={`Affichage de {first} à {last} dans ${totalRecords} éléments`}
                                    emptyMessage="Aucun élément trouvé"
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
                                >

                                    <Column
                                        field="IMAGE"
                                        header="Auteur "
                                        frozen
                                        sortable
                                        body={(item) => {
                                            const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                            return (
                                                <>

                                                    {item?.userconnected ?
                                                        <Link

                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            to={`/utilisateurs/${encodeId(item?.userconnected?.ID_UTILISATEUR)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >

                                                            <div className="d-flex round-indicator">

                                                                {item?.userconnected.IMAGE ? (
                                                                    <Image
                                                                        src={item?.userconnected?.IMAGE}
                                                                        alt="Image"
                                                                        className="rounded-5"
                                                                        imageClassName="rounded-5 object-fit-cover"
                                                                        imageStyle={{ width: "30px", height: "30px" }}
                                                                        style={{ width: "30px", height: "30px" }}
                                                                        preview
                                                                    />
                                                                ) : (
                                                                    <div style={{
                                                                        width: '30px', height: '30px',
                                                                        borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                                                        justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                                                    }}>
                                                                        {item?.userconnected?.NOM.charAt(0)}{item?.userconnected?.PRENOM.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-2 mt-1">
                                                                    <div className="font-bold">
                                                                        {item?.userconnected?.NOM} {item?.userconnected?.PRENOM}
                                                                    </div>
                                                                </div>
                                                            </div>


                                                        </Link>
                                                        : '-'}
                                                    <style>{css}</style>
                                                </>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="IMAGE"
                                        header="Approbateur "
                                        frozen
                                        sortable
                                        body={(item) => {
                                            const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                            return (
                                                <>

                                                    {item?.utilisateurapprouve ?
                                                        <Link

                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            to={`/utilisateurs/${encodeId(item?.utilisateurapprouve?.ID_UTILISATEUR)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >

                                                            <div className="d-flex round-indicator">

                                                                {item?.utilisateurapprouve.IMAGE ? (
                                                                    <Image
                                                                        src={item?.utilisateurapprouve?.IMAGE}
                                                                        alt="Image"
                                                                        className="rounded-5"
                                                                        imageClassName="rounded-5 object-fit-cover"
                                                                        imageStyle={{ width: "30px", height: "30px" }}
                                                                        style={{ width: "30px", height: "30px" }}
                                                                        preview
                                                                    />
                                                                ) : (
                                                                    <div style={{
                                                                        width: '30px', height: '30px',
                                                                        borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                                                        justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                                                    }}>
                                                                        {item?.utilisateurapprouve?.NOM.charAt(0)}{item?.utilisateurapprouve?.PRENOM.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-2 mt-1">
                                                                    <div className="font-bold">
                                                                        {item?.utilisateurapprouve?.NOM} {item?.utilisateurapprouve?.PRENOM}
                                                                    </div>
                                                                </div>
                                                            </div>


                                                        </Link>
                                                        : '-'}
                                                    <style>{css}</style>
                                                </>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="REF"
                                        header="Ref"
                                        //sortable
                                        body={(item) => {
                                            const css = `
                .round-indicator .p-image-preview-indicator {
                    border-radius: 50%;
                }`;
                                            return (
                                                <>
                                                    <Link
                                                        id={`custom-tooltip-btn_demdd-${item?.ID_RESULTAT}`}
                                                        className=" text-decoration-none d-flex round-indicator"
                                                        style={{ color: '#399af2' }}
                                                        to={`/Resultats/detail?id=${encodeId(item?.ID_RESULTAT)}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        data-pr-position="bottom"
                                                    >
                                                        <div className="d-flex round-indicator">

                                                            <div className="ml-2 mt-1">
                                                                <div className="font-bold">
                                                                    {item?.REFERENCE}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <style>{css}</style>
                                                </>
                                            );
                                        }}
                                    />

                                    <Column
                                        field="MONTANT"
                                        header="Montant"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>{item.MONTANT ? parseInt(item.MONTANT).toLocaleString('fr-FR') : 0} Fbu</span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="STATUT"
                                        frozen
                                        header="Statut"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <>
                                                    {item?.STATUT == 0 ? (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip='en attente'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                                                                color: statutAmortissementsColor(item.STATUT).textColor, border: "none"
                                                            }}
                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: statutAmortissementsColor(item.STATUT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    ) : item?.STATUT == 1 ? (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip='Approuvé'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                                                                color: statutAmortissementsColor(item.STATUT).textColor, border: "none"
                                                            }}

                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: statutAmortissementsColor(item.STATUT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    ) : (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip='En Retard'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                                                                color: statutAmortissementsColor(item.STATUT).textColor, border: "none"
                                                            }}
                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: statutAmortissementsColor(item.STATUT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    )}
                                                </>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="STATUT"
                                        frozen
                                        header="Etat"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <>
                                                    {item?.ETAT == 0 ? (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip='en attente'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                                                                color: statutAmortissementsColor(item.ETAT).textColor, border: "none"
                                                            }}
                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: statutAmortissementsColor(item.ETAT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    ) : (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip='Déjà Attribué'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                                                                color: statutAmortissementsColor(item.ETAT).textColor, border: "none"
                                                            }}

                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: statutAmortissementsColor(item.ETAT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    )

                                                    }
                                                </>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="DATE_PAIEMENT "
                                        header="Date "
                                        sortable
                                        body={(item) => {
                                            return moment(item.DATE_ENREGISTREMENT).format("DD/MM/YYYY");

                                        }}
                                    />



                                </DataTable>
                            </div>
                        </div >
                    </>
                )}

            </div >
            <Outlet />
            {/* </>)
        } */}

        </>
    );
}
