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
import socket from "../../utils/socket";
export default function ListesAgences() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const user = useSelector(userSelector);
    const [loading, setLoading] = useState(true);
    const [totalRecordsagences, settotalRecordsagences] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [bilans, setBilan] = useState([]);
    const [Groupements, setGroupements] = useState([])
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
    const [inViewMenuItem, setInViewMenuItem] = useState(null);
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
    const FetchAgences = useCallback(async (silent = false, forceRefresh = false) => {
        try {
            if (!silent) setLoading(true);
            const baseurl = `/Agences/Agences/fetch?`;

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
            // if (dates) {
            //     const [startDate, endDate] = dates;
            //     if (startDate) {
            //         url += `startDate=${startDate.toISOString()}&`;
            //     }
            //     if (endDate) {
            //         url += `endDate=${endDate.toISOString()}&`;
            //     }
            // }

            // if (comptesComptables?.code) {
            //     url += `comptesComptables=${comptesComptables.code}&`;
            // }
            // if (ID_INIT) {
            //     url += `ID_INIT=${ID_INIT}&`;
            // }

            const res = await fetchApi(url);

            setGroupements(res.result.data);
            settotalRecordsagences(res.result.totalRecords);

        } catch (error) {
            console.log(error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [lazyState,
        // dates, ID_INIT, 
        // comptesComptables

    ]);

    useEffect(() => {
        FetchAgences();
    }, [lazyState,
        //  dates,
        //   ID_INIT, 
        //   comptesComptables

    ]);
    const fetchCreditRef = useRef((silent = false, forceRefresh = false) => { });

    // Mise à jour de la ref quand FetchListeAlimentation change
    useEffect(() => {
        fetchCreditRef.current = (silent = false, forceRefresh = false) =>
            FetchAgences(silent, forceRefresh);
    }, [FetchAgences]);

    const wsCoalesceRef = useRef(null);

    useEffect(() => {
        // ✅ Définition des types et actions autorisés
        const ALLOWED_TYPES = ["cotisation", "validealimentation","cotisationAnticipe","ecriturecomptableanticipe"];
        const ALLOWED_ACTIONS = ["ajout", "update", "delete", "validation", "approbation"];
        const DEBOUNCE_DELAY = 300;

        const handler = (payload) => {

            // Validation du payload
            if (!payload?.type || !payload?.action) {
                return;
            }

            const rawType = payload.type.trim().toLowerCase();
            const rawAction = payload.action.trim().toLowerCase();
            // Filtrage par type
            if (!ALLOWED_TYPES.includes(rawType)) {
                return;
            }

            // Filtrage par action
            if (!ALLOWED_ACTIONS.includes(rawAction)) {
                return;
            }

            // Debounce
            if (wsCoalesceRef.current) {
                clearTimeout(wsCoalesceRef.current);
            }

            wsCoalesceRef.current = setTimeout(() => {
                fetchCreditRef.current?.(true, true);
                wsCoalesceRef.current = null;
            }, DEBOUNCE_DELAY);
        };
        socket.on("new_data", handler);

        return () => {
            socket.off("new_data", handler);
            if (wsCoalesceRef.current) {
                clearTimeout(wsCoalesceRef.current);
                wsCoalesceRef.current = null;
            }
        };
    }, [socket]);

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
        document.title = "Frequence credits"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'FrequenceCreditd',
                name: 'Listes'
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
    const totalMontant = Groupements?.reduce((total, item) => {
        const Montant = parseFloat(item.SOLDE_GLOBAL) || 0;
        return total + Montant;
    }, 0)



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
                    <h1 className="mb-3">Listes des Agences</h1>
                    {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
                        <Button
                            className="mt-3 ml-3 button-mobile"
                            size="small"

                            onClick={() => {
                                navigate("/Agences/add");
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
                        {/* <div className="d-flex flex-column mx-3">
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
                        </div> */}
                        {/* <div className="d-flex flex-column mt-1 mx-2">
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
                        </div> */}
                        <div className="d-flex flex-column mx-5">SOLDE
                            <span className="badge bg-danger ml-0" style={{
                                display: 'flex',
                                alignItems: 'center', gap: '8px'
                            }}>
                                <span>{totalMontant.toLocaleString("fr-FR")} Fbu</span>
                            </span>
                        </div>

                    </div>
                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            size={'small'}
                            value={Groupements}
                            // showGridlines
                            tableStyle={{ minWidth: "50rem" }}
                            className=""
                            paginator
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate={`{first} à {last} dans ${totalRecordsagences} éléments`}
                            emptyMessage="Aucun élément trouvé"
                            first={lazyState.first}
                            rows={lazyState.rows}
                            totalRecords={totalRecordsagences}
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
                                field="NOM_AGENCE"
                                frozen
                                header="Nom Agence"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.NOM_AGENCE}


                                        </span>

                                    );
                                }}
                            />
                            <Column
                                field="CODE_AGENCE "
                                frozen
                                header="Code Agence"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.CODE_AGENCE}
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="ADRESSE"
                                frozen
                                header="Adresse"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.ADRESSE}


                                        </span>

                                    );
                                }}
                            />
                            <Column
                                field="NOM_AGENCE"
                                frozen
                                header="Telephone"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.TELEPHONE}


                                        </span>

                                    );
                                }}
                            />
                            <Column
                                field="SOLDE"
                                frozen
                                header="Solde"
                                sortable
                                body={(item) => {
                                    const solde = parseFloat(item?.SOLDE_GLOBAL ?? 0);
                                    return (
                                        <span>
                                            {solde.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " Fbu"}
                                        </span>
                                    );
                                }}
                            />




                            <Column
                                field=""
                                header=""
                                alignFrozen="right"
                                frozen
                                body={(item) => {
                                    const items = [

                                        {
                                            template: (deleteItem, options) => {
                                                return (
                                                    <Link
                                                        to={`/Agences/update/${encodeId(inViewMenuItem?.ID_AGENCE)}`}
                                                        className="p-menuitem-link"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            className="bi bi-pencil-square"
                                                            viewBox="0 0 16 16"
                                                            style={{ marginRight: "0.5rem" }}
                                                        >
                                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                                            />
                                                        </svg>
                                                        <span className="p-menuitem-text">Modifier</span>
                                                    </Link>

                                                );
                                            },
                                        },
                                        //suppression ici ------------->

                                    ];
                                    return (
                                        <>
                                            <SlideMenu
                                                ref={menu}
                                                model={items}
                                                popup
                                                viewportHeight={50}
                                                menuWidth={220}
                                                onHide={() => {
                                                    setInViewMenuItem(null);

                                                }}
                                            />
                                            <Button
                                                rounded
                                                severity="secondary"
                                                text
                                                aria-label="Menu"
                                                size="small"
                                                className="mx-1"
                                                onClick={(event) => {
                                                    setInViewMenuItem(item);
                                                    menu.current.toggle(event);
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-three-dots"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                                </svg>
                                            </Button>
                                        </>
                                    );
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
