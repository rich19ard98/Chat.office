import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { userSelector } from "../../store/selectors/userSelector";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import { Tag } from 'primereact/tag';
import subText from "../../helpers/subText";
import formText from "../../helpers/formText";
import PROFILS from "../../constants/PROFILS";



export default function Abscencesignaler_Listes() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [detail_users, setDetail_users] = useState(null);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const user = useSelector(userSelector);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [employe, setEmploye] = useState(null);
    const [loadingIds, setLoadingIds] = useState(new Set());
    const [selectedReceptions, setSelectedReceptions] = useState([]);
    const [dataliste, setDataliste] = useState([])



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
            setSelectedItems(employe);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };


    //lister des menbres du microfinance
    const fetchAbsenceDemande = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/presence/presence/findAllabcsensesignale?`;
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
            setEmploye(res.result.data);
            setTotalRecords(res.result.totalRecords);


        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState,]);

    useEffect(() => {
        fetchAbsenceDemande();
    }, [lazyState]
    );

    useEffect(() => {
        document.title = "Liste des demandes d'absence"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'Demandeabs',
                name: "Liste des demandes d'absence"
            },

        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);




    // fonction pour scroll d'un message d'erreur
    const scrollToError = async () => {
        await wait(500); // attendre un petit délai pour que les erreurs soient visibles
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        const mainContent = document.querySelector(".main_content");

        if (firstErrorElement && mainContent) {
            let headerHeight = 0;
            if (header) headerHeight += header.offsetHeight;
            if (nav) headerHeight += nav.offsetHeight;

            const scrollPosition =
                firstErrorElement.getBoundingClientRect().top +
                mainContent.scrollTop -
                headerHeight;

            mainContent.scrollTo({
                top: scrollPosition,
                behavior: "smooth",
            });
        }
    };


    const fetchAbsenceDemandeValide = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchApi(`/presence/presence/findAllabcsensesignale?rows=10000000000`);
            setDataliste(res.result.data);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAbsenceDemandeValide();
    }, []);




    const ValideAbsence = async (item) => {
        setLoadingIds(prev => new Set(prev).add(item.ID_ABSENCE));

        try {
            const res = await fetchApi(`/presence/presence/valideAbsence/${item.ID_ABSENCE}`, {
                method: "GET",
            });

            dispacth(setToastAction({
                severity: "success",
                summary: "Absence validée",
                detail: "L'absence a été validée avec succès",
                life: 3000,
            }));

            fetchAbsenceDemande();
            fetchAbsenceDemandeValide();
            setSelectedReceptions([]);

        } catch (error) {
            console.error(error);

            if (error.httpStatus === "UNPROCESSABLE_ENTITY") {
                setErrors(error.result);
                dispacth(setToastAction({
                    severity: "error",
                    summary: "Erreur de validation",
                    detail: "Erreur du système, réessayez plus tard",
                    life: 3000,
                }));
                await scrollToError();
            } else {
                dispacth(setToastAction({
                    severity: "error",
                    summary: "Erreur",
                    detail: "Une erreur s'est produite, réessayez plus tard.",
                    life: 3000,
                }));
            }

        } finally {
            setLoadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(item.ID_ABSENCE); // 🔧 Correction ici
                return newSet;
            });
        }
    };
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT


    const planningPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PRESENCE)
    const hasAccess = planningPermission && (planningPermission.CAN_READ || planningPermission.CAN_WRITE)
    if (!hasAccess && !IsGerant && !IsAdminAjoin) {
        return <NotFound />
    }


    return (
        <>
            {/* <ConfirmDialog closable dismissableMask={true} /> */}
            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Demandes d'absence</h1>
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
                    </div>
                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            value={employe}
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
                                            {item?.utilisateurabsence ?

                                                <div className="d-flex round-indicator">

                                                    {item?.utilisateurabsence?.IMAGE ? (
                                                        <Image
                                                            src={item?.utilisateurabsence?.IMAGE}
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
                                                            {item?.utilisateurabsence?.NOM.charAt(0)}{item?.utilisateurabsence?.PRENOM.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="ml-2 mt-1">
                                                        <div className="font-bold">
                                                            {item?.utilisateurabsence?.USERNAME}
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
                                field="JOUR"
                                header="Réunion"
                                sortable
                                body={(item) => item?.reunionplaning?.TITRE_REUNION ? item?.reunionplaning?.TITRE_REUNION : '-'}
                            />

                            <Column
                                field="JOUR"
                                header="Motif"
                                sortable
                                body={(item) =>
                                    item?.MOTIF_ABSENCE
                                        ? formText(item.MOTIF_ABSENCE, 35).map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))
                                        : '-'
                                }
                            />

                            <Column
                                field="IS_VALIDE"
                                header="Statut"
                                sortable
                                body={(item) => {
                                    const isValid = item?.IS_VALIDE === 1;
                                    const isLoading = loadingIds.has(item.ID_ABSENCE);
                                    const isSelected = selectedReceptions.some(i => i.ID_ABSENCE === item.ID_ABSENCE);
                                    const isActionDisabled = isValid || isLoading;

                                    const onCheckboxChange = (e) => {
                                        e.stopPropagation();
                                        if (e.target.checked) {
                                            setSelectedReceptions(prev => [...prev, item]);
                                        } else {
                                            setSelectedReceptions(prev => prev.filter(i => i.ID_ABSENCE !== item.ID_ABSENCE));
                                        }
                                    };

                                    return (
                                        <div
                                            className="flex items-center gap-2"
                                            style={{ opacity: isValid ? 0.5 : 1 }}
                                        >
                                            <input
                                                type="checkbox"
                                                disabled={isValid}
                                                checked={isSelected}
                                                onChange={onCheckboxChange}
                                                style={{ cursor: 'pointer' }}
                                                onClick={(e) => e.stopPropagation()}
                                            />

                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    if (isActionDisabled) return;
                                                    ValideAbsence(item);
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 rounded-2"
                                                style={{
                                                    backgroundColor: isValid ? '#10B981' : '#3B82F6',
                                                    color: '#fff',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    cursor: isActionDisabled ? "not-allowed" : "pointer",
                                                }}
                                            >

                                                {isLoading ? (
                                                    <>
                                                        <i className="pi pi-spin pi-spinner" />
                                                        En cours
                                                    </>
                                                ) : (
                                                    <>
                                                        {isValid ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                Validée
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v3.5a.75.75 0 00.33.624l2.5 1.75a.75.75 0 10.84-1.248L10.75 9.42V6.75z" clipRule="evenodd" />
                                                                </svg>
                                                                En cours
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }}
                            />

                            <Column
                                field="DATE_INSERTION"
                                header="Date demandé"
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
