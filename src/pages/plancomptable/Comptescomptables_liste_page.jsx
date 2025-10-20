import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setBreadCrumbItemsAction,
    setToastAction,
} from "../../store/actions/appActions";
import { SlideMenu } from "primereact/slidemenu";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import Loading from "../../components/app/Loading";
import { userSelector } from "../../store/selectors/userSelector";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
/**
 * Récupérer toutes les Comptes comptables
 * @date  15/04/2025
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author rosine <gahimbarerosine9@gmail.com>
 */
export default function ComptesComptables_Liste_Page() {
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(1);
    const [comptesComptables, setComptesComptables] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [Persmissiondata, setPersmissiondata] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const menu = useRef(null);
    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [classeOptions, setClasseOptions] = useState([]);

    const [typeOptions, settypeOptions] = useState([]);
    useEffect(() => {
        const Typeoperation = [
            { label: "Actifs", value: 0 },
            { label: "Passifs", value: 1 },
            { label: "Produits", value: 2 },
            { label: "Charges", value: 3 },
        ];
        settypeOptions(Typeoperation);
    }, []);

    const user = useSelector(userSelector);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 20,
        page: 1,
        sortField: null,
        sortOrder: null,
        search: "",
        filters: {
            name: { value: "", matchMode: "contains" },
            "country.name": { value: "", matchMode: "contains" },
            company: { value: "", matchMode: "contains" },
            "representative.name": { value: "", matchMode: "contains" },
            TYPE: { value: null, matchMode: "equals" },
            CLASSE: { value: null, matchMode: "equals" },
        },
    });
    const dispacth = useDispatch();
    const handleVisibility = (e) => {
        setIsVisible(!isVisible);
    };
    const onPage = (event) => {
        setLazyState(event);
    };

    const onSort = (event) => {
        setLazyState(event);
    };

    const onFilter = (event) => {
        event["first"] = 0;
        setLazyState(event);
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
            setSelectedItems(utilisateurs);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    const ProfilSelected = async (prof) => {
        setProfil(prof);
    };

    const deleteItems = async (itemsIds) => {
        try {
            setGloabalLoading(true);
            const form = new FormData();
            form.append("ID_COMPTES_COMPTABLES", JSON.stringify(itemsIds));
            const res = await fetchApi("/plancomptable/comptescomptables/detele_comptecompable", {
                method: "POST",
                body: form,
            });
            dispacth(
                setToastAction({
                    severity: "success",
                    summary: "comptes compables supprimé",
                    detail: "comptes compables a été supprimé avec succès",
                    life: 3000,
                })
            );
            fetchComptesComptables();
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
                                {inViewMenuItem?.NOM}
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
    const fetchComptesComptables = useCallback(async () => {
        try {
            setLoading(true);
            let url = `/plancomptable/comptescomptables/fetch?`;


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

    const fetchClasses = useCallback(async () => {
        try {
            const res = await fetchApi("/plancomptable/classcomptable/fetch?");
            const classes = res.result.data.map((CLASSE) => ({
                label: CLASSE.NOM_CLASSE,
                value: CLASSE.ID_CLASSE_COMPTABLE,
            }));
            setClasseOptions(classes);
        } catch (err) {
            console.error("Erreur lors du chargement des classes :", err);
        }
    }, []);

    useEffect(() => {
        document.title = "Compte comptable";
        dispatch(
            setBreadCrumbItemsAction([
                {
                    path: "comptecomptable",
                    name: "Comptes comptables",
                },
            ])
        );
        fetchClasses();
        return () => dispatch(setBreadCrumbItemsAction([]));
    }, []);
    const TYPE_MAP = {
        0: "Actifs",
        1: "Passifs",
        2: "Produits",
        3: "Charges",
    };
    const handleFilterChange = (filterName, value) => {
        setLazyState((prev) => ({
            ...prev,
            first: 0,
            filters: {
                ...prev.filters,
                [filterName]: value
                    ? { value, matchMode: "equals" }
                    : { value: null, matchMode: "equals" },
            },
        }));
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
            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Comptes comptables</h1>
                    {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
                        <Button
                            label="ajouter compte"
                            icon="pi pi-plus"
                            size="small"
                            onClick={() => {
                                navigate("/comptecomptable/new");
                            }}
                        />
                        : null}
                </div>

                <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center flex-wrap gap-3">
                    <div className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            type="search"
                            placeholder="Recherche"
                            className="p-inputtext-sm"
                            style={{ minWidth: 200 }}
                            onInput={(e) =>
                                setLazyState((s) => ({
                                    ...s,
                                    search: e.target.value,
                                    first: 0,
                                }))
                            }
                        />
                    </div>

                    <Dropdown
                        value={lazyState.filters?.TYPE?.value ?? null}
                        options={typeOptions}
                        onChange={(e) => handleFilterChange("TYPE", e.value)}
                        placeholder="Type"
                        className="p-inputtext-sm"
                        style={{ minWidth: 160 }}
                        showClear
                    />

                    <Dropdown
                        value={lazyState.filters?.CLASSE?.value || null}
                        options={classeOptions}
                        onChange={(e) =>
                            handleFilterChange("CLASSE", e.value)
                        }
                        placeholder=" Classe"
                        className="p-inputtext-sm"
                        style={{ minWidth: 160 }}
                        showClear
                    />

                    {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
                        <div className="selection-actions d-flex align-items-center ml-3">
                            <div className="text-muted mx-3">
                                {selectedItems ? selectedItems.length : "0"} selectionné
                                {selectedItems?.length > 1 && "s"}
                            </div>
                            <a
                                href="#"
                                className={`p-menuitem-link link-dark text-decoration-none ${(!selectedItems || selectedItems?.length == 0) &&
                                    "opacity-50 pointer-events-none"
                                    }`}
                                style={{}}
                                onClick={(e) =>
                                    handleDeletePress(
                                        e,
                                        selectedItems.map((item) => item.ID_COMPTES_COMPTABLES)
                                    )
                                }
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-trash"
                                    viewBox="0 0 16 16"
                                    style={{ marginRight: "0.3rem" }}
                                >
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                </svg>
                                <span className="p-menuitem-text">Supprimer</span>
                            </a>
                        </div>
                        : null}
                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 bg-white">
          <DataTable
                                    lazy
                                    size={'small'}
                                    value={comptesComptables}
                                    // showGridlines
                                    tableStyle={{ minWidth: "50rem" }}
                                    className=""
                                    paginator
                                    rowsPerPageOptions={[5, 10, 25, 50, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]}
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate={` {first} à {last} dans ${totalRecords} éléments`}
                                    
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
                                field="CODE"
                                header="Code"
                                frozen
                                sortable
                                body={(item) => <span>{item.CODE}</span>}
                            />
                            <Column
                                field="NOM"
                                header="Comptes"
                                sortable
                                body={(item) => <span>{item.NOM}</span>}
                            />
                            <Column
                                field="TYPE"
                                header="Type"
                                sortable
                                body={(item) => <span>{TYPE_MAP[item.TYPE]}</span>}
                            />
                            <Column
                                field="CLASSE"
                                header="Classe"
                                sortable
                                body={(item) => (
                                    <span>{item.classe_comptable?.NOM_CLASSE}</span>
                                )}
                            />
                            {/* {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
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
                                                            to={`/comptecomptable/edit/${inViewMenuItem?.ID_COMPTES_COMPTABLES}`}
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
                                            {
                                                template: (deleteItem, options) => {
                                                    return (
                                                        <a
                                                            href="#"
                                                            className="p-menuitem-link text-danger"
                                                            onClick={(e) =>
                                                                handleDeletePress(e, [
                                                                    inViewMenuItem.ID_COMPTES_COMPTABLES,
                                                                ])
                                                            }
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                fill="currentColor"
                                                                className="bi bi-trash"
                                                                viewBox="0 0 16 16"
                                                                style={{ marginRight: "0.5rem" }}
                                                            >
                                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                                            </svg>
                                                            <span className="p-menuitem-text text-danger">
                                                                Supprimer
                                                            </span>
                                                        </a>
                                                    );
                                                },
                                            },



                                        ];
                                        return (
                                            <>
                                                <SlideMenu
                                                    ref={menu}
                                                    model={items}
                                                    popup
                                                    viewportHeight={100}
                                                    menuWidth={200}
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
                                                        setPersmissiondata(item);
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
                                : null} */}
                        </DataTable>
                    </div>
                </div>
            </div>
            <Outlet />
        </>
    );
}
