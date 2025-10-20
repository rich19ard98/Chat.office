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
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { encodeId } from "../../utils/IdEncryption";
import { userSelector } from "../../store/selectors/userSelector";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import { Dialog } from "primereact/dialog";
import Editerclient from "./Editerclient";
import { MultiSelect } from 'primereact/multiselect';
import PROFILS from "../../constants/PROFILS";



export default function Liste_planning_page() {
    const [date, setDate] = useState(null);
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
    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [employe, setEmploye] = useState(null);
    const [clientediter, setClientediter] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [membreData, setMembreData] = useState([]);



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





    const deleteItems = async (itemsIds) => {
        try {
            setGloabalLoading(true);
            const form = new FormData();
            form.append("ids", JSON.stringify(itemsIds));
            const res = await fetchApi("/gerers/employe/delete_employe", {
                method: "POST",
                body: form,
            });
            dispacth(
                setToastAction({
                    severity: "success",
                    summary: " employe supprimé",
                    detail: "L ' employe a été supprimé avec succès",
                    life: 3000,
                })
            );
            fetchEmploye();
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
                            {
                                // inViewMenuItem.IMAGE ?
                                //   <img
                                //     alt="flag"
                                //     src={inViewMenuItem.IMAGE}
                                //     className={`rounded object-fit-cover`}
                                //     style={{ width: "100px", height: "100px" }}
                                //   />
                                //   :
                                //   <div style={{
                                //     width: '30px', height: '30px',
                                //     borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                //     justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                //   }}>
                                //     {inViewMenuItem?.NOM.charAt(0)}{inViewMenuItem?.PRENOM.charAt(0)}
                                //   </div>
                            }

                            <div className="font-bold text-center my-2">
                                {inViewMenuItem?.NOM} {inViewMenuItem?.PRENOM}
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

    //lister des menbres du microfinance
    const fetchEmploye = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/presence/Planning/fetch?`;
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
            // console.log('res',res);
            setEmploye(res.result.data);
            setTotalRecords(res.result.totalRecords);


        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState,]);

    useEffect(() => {
        fetchEmploye();
    }, [lazyState]
    );

    useEffect(() => {
        document.title = "Liste des planing"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'Planning',
                name: 'Liste des planing'
            },

        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);




    // const NotifierReunion = () => {
    //     const handleSendNotif = async () => {
    //         const res = await fetchApi("presence/Planning/sendNotificationReunion/:ID_PLANNING", {
    //             method: "POST",
    //             selectedUsers
    //             headers: { "Content-Type": "application/json" }
    //         });

    //         if (res.ok) {
    //             alert("✅ Notification envoyée avec succès !");
    //         } else {
    //             alert("❌ Échec de l'envoi de la notification.");
    //         }
    //     };

    //     return (
    //         <button onClick={handleSendNotif}>
    //             📢 Notifier les utilisateurs mobiles de la réunion
    //         </button>
    //     );
    // };



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


    const handleValidate = async (id) => {
        try {
            const membres = selectedUsers[id] || [];
            const form = new FormData();
            form.append("selectedMembres", JSON.stringify(membres));
            const res = await fetchApi(`/presence/Planning/sendNotificationReunion/${id}`, {
                method: "PUT", // 🔁 Corrigé ici
                body: form,
            });

            // dispacth
            dispacth(setToastAction({
                severity: "success",
                summary: "Notification envoyée",
                detail: "Les membres ont bien été notifiés avec succès.",
                life: 3000,
            }));

            fetchEmploye(); // Recharger les données
        } catch (error) {
            console.error("Erreur lors de l'envoi de la notification :", error);

            if (error.httpStatus === "UNPROCESSABLE_ENTITY") {
                setErrors(error.result);
                dispacth(setToastAction({
                    severity: "error",
                    summary: "Erreur système",
                    detail: "Erreur lors de l'envoi. Veuillez réessayer plus tard.",
                    life: 3000,
                }));
                await scrollToError();
            }
        }
    };


    const fetchMembre = useCallback(async () => {
        try {
            const res = await fetchApi(`/administration/utilisateurs/fetch?rows=1000000&membre=${PROFILS?.MEMBRE}`);
            const users = res.result.data.map(access => ({
                name: `${access.PRENOM} ${access.NOM}`,
                code: access.ID_UTILISATEUR,
            }));
            setMembreData(users);
        } catch (error) {
            console.error("Erreur lors du chargement des membres :", error);
        }
    }, []);

    useEffect(() => {
        fetchMembre();
    }, []);

    const handleChangeValue = (e, rowId) => {
        setSelectedUsers(prev => ({
            ...prev,
            [rowId]: e.value
        }));
    };

    // console.log('employe',employe);

    // useEffect(() => {
    //     if (!Array.isArray(employe)) return; // ✅ Empêche l'erreur si planningList est null
    //     const initialSelections = {};
    //     employe.forEach(planning => {
    //         if (planning.membrerecusnotif?.length > 0) {
    //             initialSelections[planning.ID_PLANNING] = planning.membrerecusnotif
    //                 .map(m => m.utilisateur_recu_notif?.ID_UTILISATEUR)
    //                 .filter(Boolean); // enlève les null
    //         }
    //     });
    //     setSelectedUsers(initialSelections);
    // }, [employe]);














    const downloadQRCode = async (qrcodeUrl) => {
        const response = await fetch(qrcodeUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qrcode.png";
        a.click();
        window.URL.revokeObjectURL(url);
    };
  const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT

    const planningPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PRESENCE)
    const hasAccess = planningPermission && (planningPermission.CAN_READ || planningPermission.CAN_WRITE)
    if (!hasAccess && ! IsGerant && !IsAdminAjoin) {
        return <NotFound />
    }


    return (
        <>
            {/* <ConfirmDialog closable dismissableMask={true} /> */}
            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Planning</h1>
                    {planningPermission && planningPermission.CAN_WRITE ?
                        <Button
                            label="Plannifier une reunion"
                            icon="pi pi-plus"
                            size="small"
                            onClick={() => {
                                navigate("/Planning/add");
                            }}
                        />
                        : null}

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
                    {planningPermission && planningPermission.CAN_WRITE ?
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
                                        selectedItems.map((item) => item.ID_EMPLOYE)
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
                                header="Auteur"
                                frozen
                                sortable
                                body={(item) => {
                                    const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                    return (
                                        <>

                                            <Link
                                                //id={`custom-tooltip-btn_demd-${item.ID_REQUISITION}`}
                                                className=" text-decoration-none d-flex round-indicator"
                                                style={{ color: '#399af2' }}
                                                to={`/utilisateurs/${encodeId(item?.planing?.utilisateur?.UTILISATEUR_ID)}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                data-pr-position="bottom"
                                            >
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


                                            </Link>
                                            <style>{css}</style>
                                        </>
                                    );
                                }}
                            />
                            <Column
                                field="JOUR"
                                header="Titre"
                                sortable
                                body={(item) => item?.TITRE_REUNION ? item?.TITRE_REUNION : '-'}
                            />
                            <Column
                                field="JOUR"
                                header="Lieu"
                                sortable
                                body={(item) => item?.LIEU_REUNION ? item?.LIEU_REUNION : '-'}
                            />

                            <Column
                                field="HEURE_ENTREE"
                                header="Date"
                                sortable
                                body={(item) => item?.DATE_REUNION ? item?.DATE_REUNION : '-'}
                            />
                            <Column
                                field="HEURE_SORTIE"
                                header="Heure "
                                sortable
                                body={(item) => item?.HEURE_DEBUT ? item?.HEURE_DEBUT.substring(0, 5) : '-'}

                            />

                            <Column
                                field="NOTIFIER"
                                header="Notifier"
                                sortable
                                body={(item) => {
                                    const isEditing = selectedRowId === item.ID_PLANNING;
                                    return (
                                        <div className="d-flex align-items-center">

                                            {/* Badge nombre de membres */}
                                            <div className="mb-2 ml-3">
                                                <span className="badge bg-danger ml-2 d-flex align-items-center gap-2">
                                                    <span>{item?.membrerecusnotif?.length ?? 0}</span>
                                                </span>
                                            </div>

                                            {/* Bouton éditer si pas en édition */}
                                            {!isEditing && (
                                                <div
                                                    className="ml-2 mb-2"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setSelectedRowId(prev => {
                                                            const isSame = prev === item.ID_PLANNING;
                                                            if (!isSame) {
                                                                // Préremplir les membres si vide
                                                                if (!selectedUsers[item.ID_PLANNING]) {
                                                                    const initialSelected = item.membrerecusnotif?.map((m) => m.ID_UTILISATEUR) || [];
                                                                    setSelectedUsers(prevSelected => ({
                                                                        ...prevSelected,
                                                                        [item.ID_PLANNING]: initialSelected
                                                                    }));
                                                                }
                                                            }
                                                            return isSame ? null : item.ID_PLANNING;
                                                        });
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                                        className="bi bi-pen-fill"
                                                        viewBox="0 0 16 16">
                                                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* MultiSelect en mode édition */}
                                            {isEditing && (
                                                <div className="ml-2 d-flex align-items-center flex-wrap" style={{ minWidth: '300px', gap: '0.5rem' }}>
                                                    <MultiSelect
                                                        value={selectedUsers[item.ID_PLANNING] || []}
                                                        onChange={(e) => handleChangeValue(e, item.ID_PLANNING)}
                                                        options={membreData}
                                                        optionLabel="name"
                                                        optionValue="code"
                                                        className="p-inputtext-sm md:w-15rem"
                                                        filter
                                                        placeholder="Sélectionner les membres"
                                                        maxSelectedLabels={1}
                                                        showClear
                                                        selectedItemsLabel={`${(selectedUsers[item.ID_PLANNING]?.length || 0)} sélectionné(s)`}
                                                    />

                                                    {/* Bouton valider */}
                                                    {selectedUsers[item.ID_PLANNING]?.length > 0 && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => {
                                                                handleValidate(item.ID_PLANNING);
                                                                setSelectedRowId(null); // 👈 Cache le MultiSelect après validation
                                                            }}
                                                            title="Valider"
                                                        >
                                                            ✅
                                                        </button>

                                                    )}

                                                    {/* Bouton annuler */}
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => setSelectedRowId(null)}
                                                        title="Annuler"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                            />










                            <Column
                                field="IMAGE"
                                header="Qrcode"
                                frozen
                                sortable
                                body={(item) => {
                                    const css = `
                            .round-indicator .p-image-preview-indicator {
                            border-radius: 50%
                            }`;
                                    return (
                                        <>
                                            <div className="d-flex round-indicator">
                                                {item?.QRCODE ? (
                                                    <>
                                                        <Image
                                                            src={item?.QRCODE}
                                                            alt="Image"
                                                            className="rounded-5"
                                                            imageClassName="rounded-5 object-fit-cover"
                                                            imageStyle={{ width: "30px", height: "30px" }}
                                                            style={{ width: "30px", height: "30px" }}
                                                            preview
                                                        />
                                                        {planningPermission && planningPermission.CAN_WRITE ?
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    if (item.QRCODE) {
                                                                        downloadQRCode(item.QRCODE);
                                                                    }
                                                                }}
                                                                className="ml-3 cursor-pointer bg-red-200 text-red-900 border-circle  w-4.5rem h-3.5rem inline-flex font-bold justify-content-center align-items-center text-sm" >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                                                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                                                                </svg>
                                                            </span>

                                                            : null}

                                                    </>
                                                ) : "-"}


                                            </div>
                                            <style>{css}</style>
                                        </>
                                    );
                                }}
                            />
                            <Column
                                field="IS_CLOTURE"
                                header="Clôturé ?"
                                sortable
                                body={(item) =>
                                    item?.IS_CLOTURE === 1
                                        ? 'Clôturée'
                                        : item?.IS_CLOTURE === 0
                                            ? 'Pas encore'
                                            : '-'
                                }
                            />


                            <Column
                                field="DATE_INSERTION"
                                header="Date d'insertion"
                                sortable
                                body={(item) => {
                                    return moment(item?.DATE_INSERTION).format("DD/MM/YYYY HH:mm");
                                }}
                            />
                            {planningPermission && planningPermission.CAN_WRITE ?
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
                                                        <a
                                                            href="#"
                                                            className="p-menuitem-link text-danger"
                                                            onClick={(e) =>
                                                                handleDeletePress(e, [
                                                                    inViewMenuItem?.ID_PLANNING,
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


                                        ]


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
                                : null}

                        </DataTable>
                    </div>
                </div>

                <Dialog
                    headerStyle={{ backgroundColor: '#ecc5c5', backgroundSize: 'cover' }}
                    headerClassName="text-black"
                    // header={`Client ${modes?.clients?.NOM_CLIENT ? modes?.clients?.NOM_CLIENT : '-'}`}
                    header={`Client`}
                    visible={!!clientediter}
                    style={{ width: "60vw" }}
                    onHide={() => setClientediter(null)}
                >
                    {!clientediter ? null : <Editerclient detail={clientediter} fetchEmploye={fetchEmploye} setClientediter={setClientediter} />}
                </Dialog>
            </div>
            <Outlet />
        </>
    );
}
