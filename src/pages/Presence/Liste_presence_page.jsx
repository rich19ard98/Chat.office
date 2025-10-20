import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {setBreadCrumbItemsAction,setToastAction,} from "../../store/actions/appActions";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from 'primereact/calendar';
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { Dropdown } from "primereact/dropdown";
import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom"; // Make sure this is here
import { userSelector } from "../../store/selectors/userSelector";
import NotFound from "../home/NotFound";
import IDS_ROLES from "../../constants/IDS_ROLES";
import PROFILS from "../../constants/PROFILS";


export default function Liste_presence_page() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [details_modalUsers, setDetails_modalUsers] = useState(false);
    const [detail_users, setDetail_users] = useState(null);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [presencemembre, setpresemcemembre] = useState(null);
    const [presence, setpresence] = useState(null);
    const [utilisateurs, setutilisateurs] = useState(null);
    const [utilisateursdata, setUtilisateursdata] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const user = useSelector(userSelector);




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
            setSelectedItems(presence);
        } else {
            setSelectAll(false);
            setSelectedItems([]);

        }

    };
    const utilisateursSelected = (value) => {
        setutilisateurs(value);
        setlazyState((prev) => ({ ...prev, first: 0 })); // Reset pagination
    };


    const PresenceSelected = (value) => {
        setpresemcemembre(value);
        setlazyState((prev) => ({ ...prev, first: 0 }));
    };

    const [typepointe, settypepointe] = useState([
        {
            code: 1,
            name: 'Présent'
        },
        {
            code: 2,
            name: 'Absent'
        },
        {
            code: 3,
            name: 'Retard'
        }
    ]);

  
    // fonction pour lister  bdes utilisateurs  dans la liste deroulante
    const fetchutilisateurs = useCallback(async () => {
        try {
            var url = `/administration/utilisateurs/fetch?`;
            const res = await fetchApi(url);
            setUtilisateursdata(
                res.result.data.map((util) => {
                    return {
                        name: `${util.NOM} ${util.PRENOM}`, // Combine first and last name
                        code: util.ID_UTILISATEUR,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchutilisateurs();
    }, []);

    //lister des menbres des employes
    const fetchPresence = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/presence/presence/fetch?`;
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
            if (selectedDate) {
                url += `dateInsertion=${moment(selectedDate).format("DD/MM/YYYY")}&`;
            }
            if (utilisateurs) {
                url += `ID_UTILISATEURuser=${utilisateurs.code}&`;
            }
            if (presencemembre) {
                url += `typepointe=${presencemembre.code}&`;
            }
            const res = await fetchApi(url);
            setpresence(res.result.data);
            setTotalRecords(res.result.totalRecords);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, presencemembre, utilisateurs, selectedDate]);

    useEffect(() => {
        fetchPresence();
    }, [lazyState, presencemembre, utilisateurs, selectedDate]
    );



    useEffect(() => {
        document.title = "Liste-Présence";
        dispacth(setBreadCrumbItemsAction([administration_routes_items.Presences]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);


  const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT

    const presencePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PRESENCE)
    const hasAccess = presencePermission && (presencePermission.CAN_READ || presencePermission.CAN_WRITE)
    if (!hasAccess && !IsGerant && !IsAdminAjoin) {
        return <NotFound />
    }
    return (
        <>

            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Présence</h1>

                </div>

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
                        <div className="p-input-icon-left ml-1">
                            <Dropdown
                                value={utilisateurs}
                                onChange={(e) => utilisateursSelected(e.value)}
                                options={utilisateursdata}
                                filter
                                filterBy="name"
                                optionLabel="name"
                                placeholder="Utilisateur"
                                className="w-full md:w-15rem mx-3 no-p"
                                showClear
                            />
                        </div>
                        <div className="p-input-icon-left ml-1">
                            <Dropdown
                                value={presencemembre}
                                onChange={(e) => PresenceSelected(e.value)}
                                options={typepointe}
                                filter
                                filterBy="name"
                                optionLabel="name"
                                placeholder="Type Pointe"
                                className="w-full md:w-15rem mx-3 no-p"
                                showClear
                            />
                        </div>
                        <Calendar
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.value);
                                setlazyState((prev) => ({ ...prev, first: 0 })); // Reset pagination on date change
                            }}
                            placeholder="Filtre par date"
                            className="w-full md:w-15rem mx-1 no-p"
                            dateFormat="dd/mm/yy"
                            showClear
                        />
                    </div>

                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            value={presence}
                            tableStyle={{ minWidth: "50rem" }}
                            className=""
                            paginator
                            size="small"
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate={`{first} - {last} dans ${totalRecords} éléments`}
                            emptyMessage="Aucun element trouvé"
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
                                header="Membre"
                                frozen
                                sortable
                                body={(item) => {
                                    const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                    return (
                                        <>
                                            {item?.utilisateur ?
                                                <div className="d-flex round-indicator">
                                                    {item?.utilisateur?.IMAGE ? (
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
                                                            {item?.utilisateur?.USERNAME}
                                                        </div>
                                                    </div>
                                                </div>
                                                : '-'}
                                            <style>{css}</style>
                                        </>
                                    );
                                }}
                            />

                            <Column
                                field="MONTANT_PENALITE"
                                header="Réunion"
                                sortable
                                body={(item) => {
                                    return item?.planning?.TITRE_REUNION?item?.planning?.TITRE_REUNION:'-';
                                }}
                            />


                            <Column
                                field="DATE_POINTE"
                                header="Type pointe"
                                sortable
                                body={(item) => {
                                    const type = item?.TYPE_POINTE;
                                    let label = '';
                                    let icon = '';
                                    let badgeClass = '';

                                    switch (type) {
                                        case 1:
                                            label = 'Présent';
                                            icon = 'pi pi-check-circle';       // Icône "check"
                                            badgeClass = 'bg-success';         // Vert
                                            break;
                                        case 2:
                                            label = 'Absence justifiée';
                                            icon = 'pi pi-info-circle';        // Icône "info"
                                            badgeClass = 'bg-primary';         // Bleu
                                            break;
                                        case 3:
                                            label = 'Retard';
                                            icon = 'pi pi-clock';              // Icône "clock"
                                            badgeClass = 'bg-warning '; // Jaune
                                            break;
                                        case 4:
                                            label = 'Absence non justifiée';
                                            icon = 'pi pi-times-circle';       // Icône "times"
                                            badgeClass = 'bg-danger';          // Rouge
                                            break;
                                        default:
                                            label = 'Inconnu';
                                            icon = 'pi pi-question-circle';
                                            badgeClass = 'bg-secondary';
                                            break;
                                    }

                                    return (

                                        <div className="ml-3 mb-3">
                                            <span
                                                className={`badge  align-items-center gap-2 ${badgeClass}`}
                                                style={{ padding: '4px 8px' }}
                                            >
                                                <i className={icon}></i>
                                                <span style={{ marginLeft: '5px' }}>{label}</span>
                                            </span>
                                        </div>

                                    );
                                }}
                            />

                            <Column
                                field="MONTANT_PENALITE"
                                header="Penalité"
                                sortable
                                body={(item) => {
                                    return item?.MONTANT_PENALITE
                                        ? `${item?.MONTANT_PENALITE.toLocaleString('fr-FR')} Fbu`
                                        : '-';
                                }}
                            />


                            <Column
                                field="DATE_POINTE"
                                header="Date pointe"
                                sortable
                                body={(item) => {
                                    return item?.DATE_POINTE ? moment(item?.DATE_POINTE).format("DD/MM/YYYY") : '-';
                                }}
                            />

                            <Column
                                field="HEURE_POINTE"
                                header="Heure pointe"
                                sortable
                                body={(item) => {
                                    return item?.HEURE_POINTE
                                        ? moment(item?.HEURE_POINTE, "HH:mm:ss").format("HH:mm")
                                        : '-';
                                }}
                            />

                            <Column
                                field="DATE_INSERTION"
                                header="Date d'insertion"
                                sortable
                                body={(item) => {
                                    return moment(item?.DATE_INSERTION).format("DD/MM/YYYY HH:mm");
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