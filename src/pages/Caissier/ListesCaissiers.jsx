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
export default function ListesAgences() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const user = useSelector(userSelector);
    const [loading, setLoading] = useState(true);
    const [totalRecordscaissier, setTotalRecordscaissier] = useState(0);
    const [bilans, setBilan] = useState([]);
    const [Caissiers, setCaissiers] = useState([])
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [sessionutilisateurstatut, setUtilisateurstatut] = useState(null);

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
    const statutSelected = async (statut) => {
        setUtilisateurstatut(statut);
    };
    const [statutCaisse, setstatutCaisse] = useState([
        , {
            code: 0,
            name: "Activé"
        }, {
            code: 1,
            name: "Désactivé"
        }]);
    const CaisseSwitch = ({ caissier, change_status, disabled = false }) => {
        const [checked, setChecked] = useState(false);

        useEffect(() => {
            // IS_ACTIF = 0 => actif => switch coché
            setChecked(!!(caissier && caissier.IS_ACTIF === 0));
        }, [caissier]);

        const handleChange = (e) => {
            if (!caissier?.ID_CAISSIER) return;
            if (caissier.IS_ACTIF === 1) return
            // e.value contient la nouvelle valeur boolean du switch
            const newChecked = !!e.value;
            const statut = caissier.IS_ACTIF
            if (statut === 1) return

            // sécurité : il faut un ID_CAISSIER pour faire la requête
            if (!caissier?.ID_CAISSIER) {
                console.warn("CaisseSwitch: pas d'ID_CAISSIER, action annulée");
                return;
            }

            // si disabled, on n'envoie pas la requête
            if (disabled) {
                console.warn("CaisseSwitch: disabled, action annulée");
                // on met à jour l'UI locale quand même si tu veux :
                setChecked(newChecked);
                return;
            }

            // conversion entre checked(true) et IS_ACTIF
            // checked === true  => IS_ACTIF = 0 (actif)
            // checked === false => IS_ACTIF = 1 (inactif)
            const newStatus = newChecked ? 0 : 1;
            // Appel à ton handler parent
            try {
                change_status(caissier.ID_CAISSIER, newStatus);
            } catch (err) {
                console.error("Erreur change_status:", err);
            }

            // Mise à jour immédiate de l'état local pour UX responsive
            setChecked(newChecked);
        };

        return (
            <InputSwitch
                checked={checked}
                disabled={disabled}
                onChange={handleChange}
            />
        );
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
    const FetchCaissier = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/Caisses/Caissier/fetch?`;

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
            if (sessionutilisateurstatut) {
                url += `Utilisateurstatut=${sessionutilisateurstatut.code}&`;
            }
            const res = await fetchApi(url);

            setCaissiers(res.result.data);
            setTotalRecordscaissier(res.result.totalRecords);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState,sessionutilisateurstatut
        // dates, ID_INIT, 
        // comptesComptables

    ]);

    useEffect(() => {
        FetchCaissier();
    }, [lazyState,sessionutilisateurstatut
        //  dates,
        //   ID_INIT, 
        //   comptesComptables

    ]);
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
    const change_status = async (ID_CAISSIER) => {
        if (!ID_CAISSIER) {
            return;
        }
        try {
            const response = await fetchApi(`/Caisses/Caissier/Desactives/${ID_CAISSIER}`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: null, // pas de payload nécessaire
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Réponse backend :", data);
            } else {
                console.error("Erreur serveur :", response.status, response.statusText);
            }

        } catch (error) {
            console.error("Erreur réseau :", error);
        }
    };


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
                    <h1 className="mb-3">Historique des caissier</h1>
                    {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
                        <Button
                            className="mt-3 ml-3 button-mobile"
                            size="small"

                            onClick={() => {
                                navigate("/Caissier/add");
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
                        <div className="p-input-icon-left ml-3 ">
                            <Dropdown
                                value={sessionutilisateurstatut}
                                onChange={(e) => statutSelected(e.value)}
                                options={statutCaisse}
                                filter
                                filterBy="name"
                                optionLabel="name"
                                placeholder="Statut"
                                className="w-full md:w-10rem mx-3 no-p"
                                showClear
                            />
                        </div>
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

                    </div>
                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            size={'small'}
                            value={Caissiers}
                            // showGridlines
                            tableStyle={{ minWidth: "50rem" }}
                            className=""
                            paginator
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate={`{first} à {last} dans ${totalRecordscaissier} éléments`}
                            emptyMessage="Aucun élément trouvé"
                            first={lazyState.first}
                            rows={lazyState.rows}
                            totalRecords={totalRecordscaissier}
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
                                field="Auteur"
                                frozen
                                header="Caissier"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.utilisateur.NOM} {item?.utilisateur.PRENOM}


                                        </span>

                                    );
                                }}
                            />
                            <Column
                                field="AGENCE "
                                frozen
                                header="Nom Agence"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.agence.NOM_AGENCE}
                                        </span>
                                    );
                                }}
                            />

                            <Column
                                field="CAISSE"
                                frozen
                                header="Caisse "
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.Caisseresponsable?.NOM_CAISSE}


                                        </span>

                                    );
                                }}
                            />
                            <Column
                                field="AGENCE "
                                frozen
                                header="Date Debut"
                                sortable
                                body={(item) => {
                                    return moment(item.DATE_DEBUT).format("DD/MM/YYYY HH:mm");


                                }}
                            />
                            <Column
                                field="AGENCE"
                                frozen
                                header="Date Fin"
                                sortable
                                body={(item) => {
                                    if (!item.DATE_FIN) return "-"; // si pas de date
                                    return moment(item.DATE_FIN).format("DD/MM/YYYY HH:mm"); // sinon formate
                                }}
                            />


                            <Column
                                field="ACTIF"
                                header="Etat"
                                frozen
                                sortable
                                body={(item) => (

                                    <CaisseSwitch
                                        caissier={item} // ✅ même nom que dans le composant
                                        change_status={change_status}
                                    />
                                )}
                            />
                            {/* <Column
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
                                                        to={`/Caissier/updates/${encodeId(inViewMenuItem?.ID_CAISSIER)}`}

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
                            /> */}
                            {/* <Column
                                field=""
                                header=""
                                alignFrozen="right"
                                frozen
                                body={(item) => {
                                    const menuRef = useRef(null);

                                    const items = [
                                        {
                                            template: () => (
                                                <Link
                                                    to={`/Caissier/updates/${encodeId(inViewMenuItem?.ID_CAISSIER)}`}
                                                    className="p-menuitem-link"
                                                    onClick={(e) => e.stopPropagation()}
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
                                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293z" />
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                                        />
                                                    </svg>
                                                    <span className="p-menuitem-text">Modifier</span>
                                                </Link>
                                            ),
                                        },
                                    
                                    ];

                                    return (
                                        <>
                                            <SlideMenu
                                                ref={menuRef}
                                                model={items}
                                                popup
                                                viewportHeight={100}
                                                menuWidth={200}
                                            />
                                            <Button
                                                rounded
                                                severity="secondary"
                                                text
                                                aria-label="Menu"
                                                size="small"
                                                className="mx-1"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    menuRef.current.toggle(event);
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
                            /> */}


                        </DataTable>
                    </div>
                </div >
            </div >
            <Outlet />


        </>
    );
}
