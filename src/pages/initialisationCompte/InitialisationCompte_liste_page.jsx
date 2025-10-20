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
import { Calendar } from "primereact/calendar";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { decodeId } from "../../utils/IdEncryption";
import { useParams } from "react-router-dom";
import { encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import { userSelector } from "../../store/selectors/userSelector";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
export default function InitialisationCompte_liste_page() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const user = useSelector(userSelector);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [bilans, setBilan] = useState([]);
    const [initialisation, setInitialisation] = useState([])
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [activeButton, setActiveButton] = useState(1)
    const [afficheFrais, setAfficheFrais] = useState(1)
    const [periode, setPeriode] = useState(null)
    const navigate = useNavigate();
    const [dates, setDates] = useState(null);
    const [comptesComptables, setComptesComptables] = useState([]);
    const [Compte, setCompte] = useState([]);

    const { ID_INIT: encodedId } = useParams();
    const ID_INIT = decodeId(encodedId); // Décoder pour obtenir l'ID réel

    const [comptesComptabledata, setcomptesComptabledata] = useState([]);

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
    const comptesComptableSelected = (comptes) => {
        setComptesComptables(comptes);
    };
    const [type, settype] = useState(null)

    //fonction pour lister les frais d'adhesion
    const fetchBilan = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/initialisationCompte/initialisationCompte/fetch?`;

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

            if (comptesComptables?.code) {
                url += `comptesComptables=${comptesComptables.code}&`;
            }
            if (ID_INIT) {
                url += `ID_INIT=${ID_INIT}&`;
            }

            const res = await fetchApi(url);
            
            setInitialisation(res.result.data);
            setTotalRecords(res.result.totalRecords);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, dates, ID_INIT, comptesComptables]);

    useEffect(() => {
        fetchBilan();
    }, [lazyState, dates, ID_INIT, comptesComptables]);
    const fetchComptesComptables = useCallback(async () => {
        try {
            setLoading(true);
            let url = `/plancomptable/comptescomptables/fetch?rows=100000000000000&`;


            // Paramètres simples (hors filters)
            Object.entries(lazyState).forEach(([key, value]) => {
                if (
                    key !== "filters" &&
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                ) {
                    url += `${key}=${encodeURIComponent(value)}&`;
                }
            });

            // Extraire les valeurs des filtres TYPE et CLASSE
            const filters = lazyState.filters || {};
            const filterParams = {};

            if (filters.TYPE?.value !== undefined &&
                filters.TYPE?.value !== null) {
                filterParams.TYPE = filters.TYPE.value;
            }

            if (
                filters.CLASSE?.value !== undefined &&
                filters.CLASSE?.value !== null
            ) {
                filterParams.CLASSE = filters.CLASSE.value;
            }

            if (Object.keys(filterParams).length > 0) {
                url += `filters=${encodeURIComponent(
                    JSON.stringify(filterParams)
                )}`;
            }
            const res = await fetchApi(url);

            console.log(res);
            setCompte(
                res.result.data.map((util) => {
                    return {
                        name: `${util.NOM}`,
                        code: util.ID_COMPTES_COMPTABLES,
                    };
                })
            );
            setComptesComptables(res.result.data);

            setTotalRecords(res.result.totalRecords);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState]);
    useEffect(() => {
        fetchComptesComptables();
    }, [lazyState]);

    // console.log(bilans, "Liste")

    useEffect(() => {
        document.title = "Frais adhesion"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'frais_adh',
                name: 'Liste'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);
    const [types, setType] = useState([
        {
            code: 0,
            name: "Ouverture"
        },
        {
            code: 1,
            name: "Fermeture"
        },
    ])
    const [period, setPeriod] = useState([
        {
            code: 0,
            name: "Mensuel"
        },
        {
            code: 1,
            name: "Trimestriel"
        },
        {
            code: 2,
            name: "Annuel"
        },
    ])


    const typeSelected = async (type) => {
        settype(type);
    };
    const periodesSelected = async (periode) => {
        setPeriode(periode);
    };
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const IsAdminajoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT
    const plancomptablePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PLANCOMPTABLE)
    const planAcces = plancomptablePermission && (plancomptablePermission.CAN_READ || plancomptablePermission.CAN_WRITE)
    if (!planAcces && !IsGerant && !IsAdminajoin) {
        return <NotFound />
    }
    return (
        <>
            <ConfirmDialog closable dismissableMask={true} />
            {globalLoading && <Loading />}

            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Liste des initialisations</h1>
                    {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
                        <Button
                            className="mt-3 ml-3 button-mobile"
                            size="small"

                            onClick={() => {
                                navigate("/initialisation/add");
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                            </svg>
                            <span className="ml-1" style={{ fontWeight: 'bold' }}>Nouveau</span>
                        </Button>
                        : null}
                </div>
                <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                    <div className="d-flex  align-items-center">
                        <div className="p-input-icon-left">

                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                            </svg>
                            <InputText
                                type="search"
                                placeholder="Recherche"
                                className="p-inputtext-sm"
                                style={{ minWidth: 300 }}
                                onInput={(e) =>
                                    setlazyState((s) => ({
                                        ...s,
                                        search: e.target.value
                                    }))
                                }
                            />
                        </div>
                        <div className="d-flex flex-column mx-3">
                            <Dropdown
                                value={comptesComptables}
                                onChange={(e) => comptesComptableSelected(e.value)}
                                options={Compte}
                                filter
                                filterBy="name"
                                optionLabel="name"
                                placeholder="Type initialisation"
                                className="w-full md:w-10rem no-p"
                                showClear
                                style={{ minWidth: 300 }}
                            />
                        </div>
                        <div className="d-flex flex-column mt-1 mx-2">
                            <Calendar
                                value={dates}
                                onChange={(e) => setDates(e.value)}
                                selectionMode="range"
                                readOnlyInput
                                placeholder="Filtre par période"
                                inputStyle={{ padding: "9px 0.75rem" }}
                                showButtonBar
                                dateFormat="dd/mm/yy"
                                className="w-full md:w-14rem no-p"
                                style={{ minWidth: 100 }}
                            />
                        </div>

                    </div>
                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            size={'small'}
                            value={initialisation}
                            // showGridlines
                            tableStyle={{ minWidth: "50rem" }}
                            className=""
                            paginator
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate={`{first} à {last} dans ${totalRecords} éléments`}
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
                                header="L'auteur"
                                sortable
                                body={(item) => {
                                    const css = `
                                                            .round-indicator .p-image-preview-indicator {
                                                                border-radius: 50%;
                                                            }`;
                                    return (
                                        <>

                                            {item?.utilisateur ?
                                                <Link

                                                    className=" text-decoration-none d-flex round-indicator"
                                                    style={{ color: '#399af2' }}
                                                    to={`/utilisateurs/${encodeId(item?.utilisateur?.ID_UTILISATEUR)}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    data-pr-position="bottom"
                                                >

                                                    <div className="d-flex round-indicator">

                                                        {item?.utilisateur.IMAGE ? (
                                                            <Image
                                                                src={item?.utilisateur?.IMAGE}
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
                                                                {item?.utilisateur?.NOM.charAt(0)}{item?.utilisateur?.PRENOM.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="ml-2 mt-1">
                                                            <div className="font-bold">
                                                                {item?.utilisateur?.NOM} {item?.utilisateur?.PRENOM}
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
                                field="COMPTE_DEBIT "
                                frozen
                                header="Compte debit"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.compte_debit?.NOM}
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="COMPTE_CREDIT "
                                frozen
                                header="Compte credit"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.compte_credit?.NOM}
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="COMPTE_CREDIT "
                                frozen
                                header="Montant"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.MONTANT ? parseInt(item.MONTANT).toLocaleString('fr-FR') : 0} Fbu
                                        </span>
                                    );
                                }}
                            />

                            <Column
                                field="DATE_INITIALISATION "
                                header="Date "
                                sortable
                                body={(item) => {
                                    return moment(item.DATE_INITIALISATION).format("DD/MM/YYYY");

                                }}
                            />


                        </DataTable>
                    </div>
                </div >
            </div >
            <Outlet />


        </>
    );
}
