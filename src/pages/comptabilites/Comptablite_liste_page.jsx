import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import {
    setBreadCrumbItemsAction,
    setToastAction,
} from "../../store/actions/appActions";
import { comptabilite_routes_items } from "../../routes/admin/comptabilite_routes";
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
import { administration_routes_items } from "../../routes/admin/administration_routes";
import IDS_ROLES from "../../constants/IDS_ROLES";
import { userSelector } from "../../store/selectors/userSelector";

export default function Comptabilite_liste_page() {
    const [date, setDate] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [charge_depenses, setCharge_depenses] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);
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
            setSelectedItems(charge_depenses);
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
            const res = await fetchApi("/comptabilite/charge_depenses/detele_charge_depensess", {
                method: "POST",
                body: form,
            });
            dispacth(
                setToastAction({
                    severity: "success",
                    summary: "charge  supprimé",
                    detail: "Le charge a été supprimé avec succès",
                    life: 3000,
                })
            );
            fetchCharge_depense();
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
    //lister les charges depenses
    const fetchCharge_depense = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/comptabilite/charges_depenses/fetchcharge?`;
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
            setCharge_depenses(res.result.data);
            setTotalRecords(res.result.totalRecords);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState,
       

    ]);

    useEffect(() => {
        fetchCharge_depense();

    },
        [fetchCharge_depense]
    );



    useEffect(() => {
        document.title = "Charge depenses"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'charge_depenses',
                name: 'Charge depenses'
            }
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);


    const comptabilitePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COMPTABILITES)
    const compAcces = comptabilitePermission && (comptabilitePermission.CAN_READ || comptabilitePermission.CAN_WRITE)
    if (!compAcces) {
        // return <NotFounnd/>
    }
    return (
        <>
            {/* <ConfirmDialog closable dismissableMask={true} /> */}
            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
           

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
                    {comptabilitePermission && comptabilitePermission.CAN_WRITE ?
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
                                    selectedItems.map((item) => item.ID_CHARGES_DEPENSES)
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
                    :null}
                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            value={charge_depenses}
                            tableStyle={{ minWidth: "50rem" }}
                            className=""
                            paginator
                            size="small"
                            rowsPerPageOptions={[5, 10, 25, 50]}
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
                                selectionMode="multiple"
                                frozen
                                headerStyle={{ width: "3rem" }}
                            />

                            <Column
                                field=""
                                header=""
                                frozen
                                sortable
                                body={(item) => {
                                    const css = `
                            .round-indicator .p-image-preview-indicator {
                            border-radius: 50%
                            }`;
                                   
                                }}
                            />

                            <Column
                                field="TYPE_CHARGE"
                                header="type charge"
                                sortable
                                body={(item) => item.types_charges_depense.TYPE_CHARGE}
                            />
                            <Column
                                field="LIBELLE"
                                header="libelle"
                                sortable
                                body={(item) => item.LIBELLE}
                            />
                            <Column
                                field="MONTANT"
                                header="Montant"
                                sortable
                                body={(item) => item.MONTANT}
                            />
                            <Column
                                field="UTILISATEUR_ID"
                                header="utilisateurs"
                                sortable
                                body={(item) => item?.utilisateurs?.USERNAME
                                }
                            />

                            <Column
                                field="DATE_DEPENSE"
                                header="Date depense"
                                sortable
                                body={(item) => {
                                    return moment(item.DATE_DEPENSE).format("DD/MM/YYYY HH:mm");
                                }}
                            />
                         
                        </DataTable>
                    </div>
                </div>
            </div>
            <Outlet />
        </>
    );
}
