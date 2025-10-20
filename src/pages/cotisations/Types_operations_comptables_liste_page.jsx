import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setBreadCrumbItemsAction,
    setToastAction,
} from "../../store/actions/appActions";
import { welcome_routes_items } from "../../routes/welcome/welcome_routes";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { encodeId } from "../../utils/IdEncryption";
import { Dropdown } from "primereact/dropdown";
import IDS_ROLES from "../../constants/IDS_ROLES";
import { userSelector } from "../../store/selectors/userSelector";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";



export default function Types_operations_comptables_liste_page() {
    const [selectedCity, setSelectedCity] = useState(null);
    const [date, setDate] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [types_operations_comptables, setTypes_operations_comptables] = useState([]);
    const [details_modalUsers, setDetails_modalUsers] = useState(false);
    const [detail_users, setDetail_users] = useState(null);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [visibleStatut, setVisibleStatut] = useState(false);
    const navigate = useNavigate();
    const user = useSelector(userSelector);
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
            setSelectedItems(types_operations_comptables);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    const deleteItems = async (itemsIds) => {
        try {
            setGloabalLoading(true);
            const form = new FormData();
            form.append("ids", JSON.stringify(itemsIds));
            const res = await fetchApi("/cotisation/types_operations_comptables/delete", {
                method: "POST",
                body: form,
            });
            dispacth(
                setToastAction({
                    severity: "success",
                    summary: "types operations comptables supprimé",
                    detail: "types operations comptables a été supprimé avec succès",
                    life: 3000,
                })
            );
            fetchTypes_operations_comptables();
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
    const fetchTypes_operations_comptables = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/cotisation/types_operations_comptables/fetchtypeoperation?`;
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
            const res = await fetchApi(url);
            setTypes_operations_comptables(res.result.data);
            setTotalRecords(res.result.totalRecords);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState]
    );

    useEffect(() => {
        fetchTypes_operations_comptables();

    },
        [fetchTypes_operations_comptables]
    );
    useEffect(() => {
        document.title = " Opérations"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'types_operations_comptables',
                name: 'Opérations'
            }
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
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
            {/* <ConfirmDialog closable dismissableMask={true} /> */}
            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
                {!cotisationPermission?.CAN_READ || !cotisationPermission?.CAN_WRITE ? null : (
                    <div className="d-flex align-items-center justify-content-between">
                        <h1 className="mb-3"> Opérations</h1>
                        <Button
                            className="mt-3 ml-3 button-mobile"
                            size="small"
                            onClick={() => {
                                navigate("/types_operations_comptables/new");
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                            </svg>
                            <span className="ml-1" style={{ fontWeight: 'bold' }}>Nouveau</span>
                        </Button>
                    </div>
                )}


                <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                    <div className="d-flex  align-items-center">
                        <div className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                                type="search"
                                placeholder="Recherche"

                                className="p-inputtext-sm"
                                style={{ minWidth: 300 }}
                                onInput={(e) =>
                                    setlazyState((s) => ({ ...s, search: e.target.value }))
                                }
                            />

                        </div>
                    </div>
                    {cotisationPermission && cotisationPermission.CAN_WRITE ?
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
                                        selectedItems.map((item) => item.ID_TYPES_CHARGES_DEPENSE)
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
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            value={types_operations_comptables}
                            tableStyle={{ minWidth: "50rem" }}
                            className=""
                            paginator
                            size="small"
                            rowsPerPageOptions={[5, 10, 25, 50, 100, 250, 500]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate={`{first} - {last} dans ${totalRecords} éléments`}
                            emptyMessage="Aucun element trouvé"
                            // paginatorLeft={paginatorLeft}
                            // paginatorRight={paginatorRight}
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
                        // size="normal"
                        >
                            <Column
                                field="NOM_OPERATION "
                                header="Opérations "
                                sortable
                                body={(item) => item.NOM_OPERATION}
                            />

                            <Column
                                field="COMPTE_DEBIT"
                                header="Compte débit"
                                sortable
                                body={(item) => item.comptes_debit?.NOM}
                            />
                            <Column
                                field="COMPTE_CREDIT"
                                header="Compte crédit"
                                sortable
                                body={(item) =>
                                    item.comptes_credit?.NOM
                                }
                            />
                            {/* {cotisationPermission && cotisationPermission.CAN_WRITE ?
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
                                                        to={`/types_operations_comptables/edit/${encodeId(inViewMenuItem?.ID_TYPES_OPERATIONS)}`}
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
                                                                inViewMenuItem.ID_TYPES_OPERATIONS,
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
                                                    setDetail_users(item)
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
                            :null} */}
                        </DataTable>
                    </div>
                </div>
            </div>
            <Outlet />
        </>
    );
}
