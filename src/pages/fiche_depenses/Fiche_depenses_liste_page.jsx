import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setBreadCrumbItemsAction,
    setToastAction,
} from "../../store/actions/appActions";
import { userSelector } from "../../store/selectors/userSelector";
import PROFILS from "../../constants/PROFILS"; // Ajouter cette ligne
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
import { Calendar } from "primereact/calendar";
import { decodeId } from "../../utils/IdEncryption";
import { useParams } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import statutDepenseColor from "../../helpers/statutDepenseColor";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
export default function Fiche_depenses_liste_page() {
    const [date, setDate] = useState(null);
    const [dates, setDates] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [fiche_depenses, setFiche_depenses] = useState([]);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const { ID_FICHE_DEPENSES: encodedId } = useParams();
    const ID_FICHE_DEPENSES = decodeId(encodedId); // Décoder pour obtenir l'ID réel

    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const user = useSelector(userSelector);
    const [employeOptions, setEmployeOption] = useState([]);
    const [fournisseurOptions, setFournisseurOption] = useState([]);
    const [employe, setEmploye] = useState(null);
    const [fournisseur, setFournisseur] = useState(null);
    const [auteursOptions, setAuteursOption] = useState([]);
    const [detail_users, setDetail_users] = useState(null);
    const [auteurs, setAuteurs] = useState(null);
    const [statutdata, setStatutdata] = useState(null);

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

    const dispatch = useDispatch();
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
            setSelectedItems(fiche_depenses);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    const fetchEmploye = useCallback(async () => {
        try {
            const baseurl = `/gerers/employe/fetch?row=100000&`;
            const res = await fetchApi(baseurl);
            const updatedRef = res.result.data.map((clt) => ({
                name: `${clt.NOM} ${clt.PRENOM}`,
                code: clt.ID_EMPLOYE,
            }));
            setEmployeOption(updatedRef);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchEmploye();
    }, []);

    // Fonction pour lister les utilisateurs
    const fetchAuteurs = useCallback(async () => {
        try {
            const url = `/administration/utilisateurs/fetch?row=100000&`;
            const res = await fetchApi(url);
            setAuteursOption(
                res.result.data.map((util) => ({
                    name: util.USERNAME,
                    code: util.ID_UTILISATEUR,
                }))
            );
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchAuteurs();
    }, []);

    // Fonction pour lister les statuts de dépenses
    const [statutsDepense, setStatutsDepense] = useState([
        { code: 0, name: 'En Brouillon' },
        { code: 1, name: "En attente d'approbation" },
        { code: 2, name: 'Approuvé' },
        { code: 3, name: 'Annuler' },
        { code: 4, name: 'Payé' },
    ]);

    const deleteItems = async (itemsIds) => {
        try {
            setGloabalLoading(true);
            const form = new FormData();
            form.append("ids", JSON.stringify(itemsIds));
            const res = await fetchApi("/depenses/fiche_depenses/deletefiche", {
                method: "POST",
                body: form,
            });
            dispatch(
                setToastAction({
                    severity: "success",
                    summary: "Dépense supprimée",
                    detail: "La dépense a été supprimée avec succès",
                    life: 3000,
                })
            );
            fetchstockmp();
            setSelectAll(false);
            setSelectedItems(null);
        } catch (error) {
            console.log(error);
            dispatch(
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
            header: "Supprimer ?",
            message: (
                <div className="text-center">
                    Voulez-vous vraiment supprimer les éléments sélectionnés ?
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

    const fetchstockmp = useCallback(async () => {
        try {
            setLoading(true)
            const baseurl = `/depenses/fiche_depenses/fetch?`;

            let url = baseurl;

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
            if (auteurs) url += `isAuteurs=${auteurs.code}&`;
            if (employe) url += `isEmploye=${employe.code}&`;
            if (statutdata) url += `statutdata=${statutdata.code}&`;
            if (ID_FICHE_DEPENSES) {
                url += `ID_FICHE_DEPENSES=${ID_FICHE_DEPENSES}&`;
            }
            const res = await fetchApi(url);

            setFiche_depenses(res.result.data);
            setTotalRecords(res.result.totalRecords);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, employe,ID_FICHE_DEPENSES, auteurs, statutdata, dates]);

    useEffect(() => {
        document.title = "Dépenses";
        dispatch(setBreadCrumbItemsAction([{ path: 'ficheDep', name: 'Liste' }]));
        return () => {
            dispatch(setBreadCrumbItemsAction([]));
        };
    }, []);

    useEffect(() => {
        fetchstockmp();
    }, [lazyState, employe,ID_FICHE_DEPENSES, auteurs, statutdata, dates]);

    const employeSelected = async (emp) => {
        setEmploye(emp);
    };
    const auteursSelected = async (au) => {
        setAuteurs(au);
    };
    const statutSelected = async (statut) => {
        setStatutdata(statut);
    };

    // Calcul du montant total
    const totalValue = fiche_depenses.reduce((total, commde) => {
        const montant = parseFloat(commde.MONTANT_TOTAL);
        return total + (isNaN(montant) ? 0 : montant);
    }, 0);

    const formattedTotal = totalValue.toLocaleString('fr') + '';
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT
    const comptabilitePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COMPTABILITES)
    const compAcces = comptabilitePermission && (comptabilitePermission.CAN_READ || comptabilitePermission.CAN_WRITE)
    if (!compAcces
         && !IsGerant 
         && !IsAdminAjoin
        ) {
        return <NotFound />
    }

    return (
        <>
            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Fiche dépenses</h1>
                    {comptabilitePermission && comptabilitePermission.CAN_WRITE ?
                        <Button
                            className="mt-3 ml-3 button-mobile"
                            size="small"
                            onClick={() => {
                                navigate("/fiche_depenses/new");
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-plus-lg" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                            </svg>
                            <span className="ml-1" style={{ fontWeight: 'bold' }}>Nouveau</span>
                        </Button>
                        : null}
                </div>
                <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <div className="p-input-icon-left mx-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                            </svg>
                            <InputText
                                type="search"
                                placeholder="Recherche"
                                className="p-inputtext-sm"
                                style={{ minWidth: 300 }}
                                onInput={(e) => setlazyState((s) => ({ ...s, search: e.target.value }))}
                            />
                        </div>

                        <div className="p-input-icon-left mx-2 dropdown-spacing">
                            <Dropdown
                                value={employe}
                                onChange={(e) => employeSelected(e.value)}
                                options={employeOptions}
                                filter
                                filterBy="name"
                                optionLabel="name"
                                placeholder="Employés"
                                className="w-full md:w-17rem no-p"
                                showClear
                            />
                        </div>

                        {user.ID_PROFIL === PROFILS.ADMIN || user.ID_PROFIL === PROFILS.SUPER_ADMIN ? (
                            <div className="p-input-icon-left mx-2 dropdown-spacing">
                                <Dropdown
                                    value={auteurs}
                                    onChange={(e) => auteursSelected(e.value)}
                                    options={auteursOptions}
                                    filter
                                    filterBy="name"
                                    optionLabel="name"
                                    placeholder="Auteurs"
                                    className="w-full md:w-17rem no-p"
                                    showClear
                                />
                            </div>
                        ) : null}
                    </div>
                    {comptabilitePermission && comptabilitePermission.CAN_WRITE ?
                        <div className="selection-actions d-flex align-items-center">
                            <div className="text-muted mx-3">
                                {selectedItems ? selectedItems.length : "0"} sélectionné
                                {selectedItems?.length > 1 && "s"}
                            </div>
                            <a
                                href="#"
                                className={`p-menuitem-link link-dark text-decoration-none ${(!selectedItems || selectedItems?.length === 0) &&
                                    "opacity-50 pointer-events-none"
                                    }`}
                                onClick={(e) =>
                                    handleDeletePress(
                                        e,
                                        selectedItems.map((item) => item.ID_FICHE_DEPENSES)
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
                <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <div className="d-flex flex-column">
                            <div className="d-flex align-items-center mt-2">
                                <div className="p-input-icon-left mx-2">
                                    <Dropdown
                                        value={statutdata}
                                        options={statutsDepense}
                                        onChange={(e) => statutSelected(e.value)}
                                        filter
                                        filterBy="name"
                                        optionLabel="name"
                                        placeholder="Statut"
                                        className="w-full md:w-18rem no-p"
                                        showClear
                                    />
                                </div>

                                <div className="p-input-icon-left mx-2">
                                    <Calendar
                                        value={dates}
                                        onChange={(e) => setDates(e.value)}
                                        selectionMode="range"
                                        readOnlyInput
                                        placeholder="Filtre par période"
                                        inputStyle={{ padding: "9px 0.75rem" }}
                                        showButtonBar
                                        todayButtonClassName="opacity-0"
                                        dateFormat="dd/mm/yy"
                                        inputClassName="cursor-pointer"
                                        className="w-full md:w-18rem no-p"
                                        maxDate={new Date()}
                                        style={{ minWidth: 100 }}
                                    />
                                </div>

                                <div className="text-muted mx-2">
                                    <strong className="ml-4">M.T</strong>
                                </div>
                                <span className="p-menuitem-text">
                                    <strong className="ml-2" style={{ color: 'blue' }}>
                                        {formattedTotal} FBU
                                    </strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            value={fiche_depenses}
                            tableStyle={{ minWidth: "50rem" }}
                            paginator
                            size="small"
                            rowsPerPageOptions={[5, 10, 25, 50, 100, 250, 500]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate={`{first} - {last} dans ${totalRecords} éléments`}
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
                            {comptabilitePermission && comptabilitePermission.CAN_WRITE ?
                                <Column
                                    selectionMode="multiple"
                                    frozen
                                    headerStyle={{ width: "3rem" }}
                                />
                                : null}
                            <Column
                                field="IMAGE"
                                header="Réf.Dépense"
                                sortable
                                body={(item) => (
                                    <Link
                                        id={`Nocmnde-${item.ID_FICHE_DEPENSES}`}
                                        className="text-decoration-none d-flex round-indicator"
                                        style={{ color: '#399af2' }}
                                        to={`/fiche_depenses/details/${encodeId(item.ID_FICHE_DEPENSES)}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span>{item.REFERENCE_FICHE_DEPENSE}</span>
                                    </Link>
                                )}
                            />

                            <Column
                                field="BENEFICIAIRE"
                                header="Auteur"
                                sortable
                                body={(item) => {
                                    const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                    return (
                                        <>


                                            <Link
                                                id={`custom-tooltip-btn_demd-${item.ID_FICHE_DEPENSES}`}
                                                className=" text-decoration-none d-flex round-indicator"
                                                style={{ color: '#399af2' }}
                                                to={`/utilisateurs/${encodeId(item?.utilisateur?.ID_UTILISATEUR)}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                data-pr-position="bottom"
                                            >
                                                <div className="d-flex round-indicator">
                                                    {item?.utilisateur?.IMAGE ? (
                                                        <Image
                                                            src={item?.utilisateur?.IMAGE}
                                                            alt="Image"
                                                            className="rounded-5"
                                                            imageClassName="rounded-5 object-fit-cover"
                                                            imageStyle={{ width: "25px", height: "25px" }}
                                                            style={{ width: "25px", height: "25px" }}
                                                            preview
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '25px', height: '25px',
                                                            borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                                            justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                                        }}>
                                                            {item?.utilisateur?.NOM.charAt(0) + `` + item?.utilisateur?.PRENOM.charAt(0)}
                                                        </div>
                                                    )}

                                                    <div className="ml-2 mt-1">
                                                        <div className="font-bold">
                                                            {item?.utilisateur?.USERNAME}
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
                                field="VALIDE_PAR"
                                header="Validateur"
                                sortable
                                body={(item) => {
                                    const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                    return (
                                        <>


                                            <Link
                                                id={`custom-tooltip-btn_demd-${item.ID_FICHE_DEPENSES}`}
                                                className=" text-decoration-none d-flex round-indicator"
                                                style={{ color: '#399af2' }}
                                                to={`/utilisateurs/${encodeId(item?.validateur?.ID_UTILISATEUR)}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                data-pr-position="bottom"
                                            >
                                                {item?.validateur ? <>
                                                    <div className="d-flex round-indicator">
                                                        {item?.validateur?.IMAGE ? (
                                                            <Image
                                                                src={item?.validateur?.IMAGE}
                                                                alt="Image"
                                                                className="rounded-5"
                                                                imageClassName="rounded-5 object-fit-cover"
                                                                imageStyle={{ width: "25px", height: "25px" }}
                                                                style={{ width: "25px", height: "25px" }}
                                                                preview
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                width: '25px', height: '25px',
                                                                borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                                                justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                                            }}>
                                                                {item?.validateur?.NOM.charAt(0) + `` + item?.validateur?.PRENOM.charAt(0)}
                                                            </div>
                                                        )}

                                                        <div className="ml-2 mt-1">
                                                            <div className="font-bold">
                                                                {item?.validateur?.USERNAME}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </> : '-'}


                                            </Link>
                                            <style>{css}</style>
                                        </>
                                    );
                                }}
                            />


                            <Column
                                field="IMAGE"
                                header="Bénéficiaire"
                                // frozen
                                sortable
                                body={(item) => {
                                    const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                    return (
                                        <>
                                            {item.IS_BENEFICIAIRE == 0 ? (
                                                <>
                                                    {item?.fourn ?
                                                        <Link
                                                            id={`custom-tooltip-btn-${item.ID_FICHE_DEPENSES}`}
                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            // to={`/clients/update1/${item?.clients?.ID_CLIENT}`}
                                                            to={`/fournisseur/${encodeId(item?.fourn?.IDFOURNISSEUR)}`}

                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >
                                                            {item?.fourn ?
                                                                <div className="d-flex round-indicator">
                                                                    <div style={{
                                                                        width: '25px', height: '25px',
                                                                        borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                                                        justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                                                    }}>
                                                                        {item?.fourn?.NOM_COMPLET.charAt(0)}
                                                                    </div>

                                                                    <div className="ml-2 mt-1">
                                                                        <div className="font-bold">
                                                                            {item?.fourn?.NOM_COMPLET ? item?.fourn?.NOM_COMPLET : '-'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                : '-'}

                                                        </Link>
                                                        : '-'}
                                                </>
                                            ) : (
                                                <>
                                                    {item?.empl ?
                                                        <Link
                                                            id={`custom-tooltip-btn-${item.ID_FICHE_DEPENSES}`}
                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            // to={`/clients/update1/${item?.clients?.ID_CLIENT}`}
                                                            to={`/employe/${encodeId(item?.empl?.ID_EMPLOYE)}`}

                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >
                                                            {item?.empl ?
                                                                <div className="d-flex round-indicator">
                                                                    <div style={{
                                                                        width: '25px', height: '25px',
                                                                        borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                                                        justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                                                    }}>
                                                                        {item?.empl?.NOM.charAt(0)}
                                                                    </div>

                                                                    <div className="ml-2 mt-1">
                                                                        <div className="font-bold">
                                                                            {item?.empl?.NOM ? `${item?.empl?.NOM} ${item?.empl?.PRENOM}  ` : '-'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                : '-'}

                                                        </Link>
                                                        : '-'}
                                                </>
                                            )}



                                            <style>{css}</style>
                                        </>
                                    );
                                }}
                            />

                            <Column
                                field="MONTANT_TOTAL"
                                header="Montant total"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>{item.MONTANT_TOTAL ? parseFloat(item.MONTANT_TOTAL).toLocaleString('fr-FR') : 0} Fbu</span>
                                    );
                                }}
                            />
                            <Column
                                field="MODE_PAIEMENT"
                                frozen
                                header="M.paye"
                                sortable
                                body={(item) => {
                                    return (
                                        <>
                                            {item?.MODE_PAIEMENT == 0 ? (
                                                <Button className="btn-sm"
                                                    data-pr-tooltip='Espèce'
                                                    tooltip tooltipOptions={{ position: 'top' }}
                                                    style={{
                                                        width: 25, height: 25, backgroundColor: modePaiementDetailColor(item.MODE_PAIEMENT).backgroundColor,
                                                        color: modePaiementDetailColor(item.MODE_PAIEMENT).textColor, border: "none"
                                                    }}
                                                    icon={options => {
                                                        return (
                                                            <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: modePaiementDetailColor(item.MODE_PAIEMENT).icon
                                                                }} />
                                                        );
                                                    }} />
                                            ) : item?.MODE_PAIEMENT == 1 ? (
                                                <Button className="btn-sm"
                                                    data-pr-tooltip='Bancaire'
                                                    tooltip tooltipOptions={{ position: 'top' }}
                                                    style={{
                                                        width: 25, height: 25, backgroundColor: modePaiementDetailColor(item.MODE_PAIEMENT).backgroundColor,
                                                        color: modePaiementDetailColor(item.MODE_PAIEMENT).textColor, border: "none"
                                                    }}
                                                    icon={options => {
                                                        return (
                                                            <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: modePaiementDetailColor(item.MODE_PAIEMENT).icon
                                                                }} />
                                                        );
                                                    }} />
                                            ) : (
                                                <Button className="btn-sm"
                                                    data-pr-tooltip='Virement'
                                                    tooltip tooltipOptions={{ position: 'top' }}
                                                    style={{
                                                        width: 25, height: 25, backgroundColor: modePaiementDetailColor(item.MODE_PAIEMENT).backgroundColor,
                                                        color: modePaiementDetailColor(item.MODE_PAIEMENT).textColor, border: "none"
                                                    }}
                                                    icon={options => {
                                                        return (
                                                            <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: modePaiementDetailColor(item.MODE_PAIEMENT).icon
                                                                }} />
                                                        );
                                                    }
                                                    }

                                                />
                                            )}
                                        </>
                                    );
                                }}
                            />

                            <Column
                                field="STATUS"
                                frozen
                                header="Status"
                                sortable
                                body={(item) => {
                                    return (
                                        <>
                                            {item?.STATUT == 0 ? (
                                                <Button className="btn-sm"
                                                    data-pr-tooltip='En Brouillon'
                                                    tooltip tooltipOptions={{ position: 'top' }}
                                                    style={{
                                                        width: 25, height: 25, backgroundColor: statutDepenseColor(item.STATUT).backgroundColor,
                                                        color: statutDepenseColor(item.STATUT).textColor, border: "none"
                                                    }}
                                                    icon={options => {
                                                        return (
                                                            <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: statutDepenseColor(item.STATUT).icon
                                                                }} />
                                                        );
                                                    }} />
                                            ) : item?.STATUT == 1 ? (
                                                <Button className="btn-sm"
                                                    data-pr-tooltip="En attente d'approbation"
                                                    tooltip tooltipOptions={{ position: 'top' }}
                                                    style={{
                                                        width: 25, height: 25, backgroundColor: statutDepenseColor(item.STATUT).backgroundColor,
                                                        color: statutDepenseColor(item.STATUT).textColor, border: "none"
                                                    }}
                                                    icon={options => {
                                                        return (
                                                            <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: statutDepenseColor(item.STATUT).icon
                                                                }} />
                                                        );
                                                    }} />
                                            ) : item?.STATUT == 2 ? (
                                                <Button className="btn-sm"
                                                    data-pr-tooltip='Approuvé'
                                                    tooltip tooltipOptions={{ position: 'top' }}
                                                    style={{
                                                        width: 25, height: 25, backgroundColor: statutDepenseColor(item.STATUT).backgroundColor,
                                                        color: statutDepenseColor(item.STATUT).textColor, border: "none"
                                                    }}
                                                    icon={options => {
                                                        return (
                                                            <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: statutDepenseColor(item.STATUT).icon
                                                                }} />
                                                        );
                                                    }} />
                                            ) : item?.STATUT == 3 ? (
                                                <Button className="btn-sm"
                                                    data-pr-tooltip='Annuler'
                                                    tooltip tooltipOptions={{ position: 'top' }}
                                                    style={{
                                                        width: 25, height: 25, backgroundColor: statutDepenseColor(item.STATUT).backgroundColor,
                                                        color: statutDepenseColor(item.STATUT).textColor, border: "none"
                                                    }}
                                                    icon={options => {
                                                        return (
                                                            <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: statutDepenseColor(item.STATUT).icon
                                                                }} />
                                                        );
                                                    }} />
                                            ) : (
                                                <Button className="btn-sm"
                                                    data-pr-tooltip='Payé'
                                                    tooltip tooltipOptions={{ position: 'top' }}
                                                    style={{
                                                        width: 25, height: 25, backgroundColor: statutDepenseColor(item.STATUT).backgroundColor,
                                                        color: statutDepenseColor(item.STATUT).textColor, border: "none"
                                                    }}
                                                    icon={options => {
                                                        return (
                                                            <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: statutDepenseColor(item.STATUT).icon
                                                                }} />
                                                        );
                                                    }} />
                                            )}
                                        </>
                                    );
                                }}
                            />

                            <Column
                                field="DATE_DEPENSE "
                                header="Date "
                                sortable
                                body={(item) => {
                                    return moment(item.DATE_DEPENSE).format("DD/MM/YYYY");

                                }}
                            />
                            {/* Ajoutez d'autres colonnes ici */}



                        </DataTable>
                    </div>
                </div>
            </div>
            <Outlet />
        </>
    );
}