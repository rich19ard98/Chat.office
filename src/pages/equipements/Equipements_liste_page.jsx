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
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
//import statutComdeMedicaColor from "../../helpers/statutComdeAccessColor";
import { encodeId } from "../../utils/IdEncryption";
import { useParams } from "react-router-dom";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
// import Frais_adhesion_add_page from "./Frais_adhesion_add_page";
import { userSelector } from "../../store/selectors/userSelector";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";


export default function Equipements_liste_page() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const user = useSelector(userSelector);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [bilans, setBilan] = useState([]);
    const [equipements, setEquipement] = useState([])
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [activeButton, setActiveButton] = useState(1)
    const [afficheFrais, setAfficheFrais] = useState(1)
    const [periode, setPeriode] = useState(null)
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
            setSelectedItems(credits);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };




    const [type, settype] = useState(null)

    //fonction pour lister les frais d'adhesion
    const fetchequipements = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/equipements/equipements/fetch?&rows=${lazyState.rows}&`;

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
            setEquipement(res.result.data);
            setTotalRecords(res.result.totalRecords);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState]);

    useEffect(() => {
        fetchequipements();
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
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT

    const gerePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.GERER)
    const gereAcces = gerePermission && (gerePermission.CAN_READ || gerePermission.CAN_WRITE)
    if (!gereAcces && !IsGerant && !IsAdminAjoin) {
        return <NotFound />
    }
    return (
        <>
            <ConfirmDialog closable dismissableMask={true} />
            {globalLoading && <Loading />}

            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Liste des equipements</h1>
                    {/* <Button
                                label="Nouveau"
                                icon="pi pi-plus"
                                size="small"
                                onClick={
                                    handlAddPageFrais}
                            /> */}
                    {gerePermission && gerePermission.CAN_WRITE ?
                        <Button
                            className="mt-3 ml-3 button-mobile"
                            size="small"

                            onClick={() => {
                                navigate("/equipements/add");
                                // handlAddPageFrais
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
                                    setlazyState((s) => ({ ...s, search: e.target.value }))
                                }
                            />
                        </div>
                    

                    </div>


                    {/* <div className="p-input-icon-left ml-3">

                     
                    </div> */}
                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            size={'small'}
                            value={equipements}
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
                                field="REF"
                                header="Ref"
                                //sortable
                                body={(item) => {
                                    const css = `
              .round-indicator .p-image-preview-indicator {
                  border-radius: 50%;
              }`;
                                    return (
                                        <>
                                            <Link
                                                id={`custom-tooltip-btn_demdd-${item?.ID_EQUIP}`}
                                                className=" text-decoration-none d-flex round-indicator"
                                                style={{ color: '#399af2' }}
                                                to={`/equipements/details?id=${item?.ID_EQUIP}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                data-pr-position="bottom"
                                            >
                                                <div className="d-flex round-indicator">

                                                    <div className="ml-2 mt-1">
                                                        <div className="font-bold">
                                                            {item?.CODE_EQUIP}
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
                                field="CREATED_BY "
                                frozen
                                header="Equipements"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.compte?.NOM}
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="VALEUR_BRUTE "
                                frozen
                                header="Valeur brutte"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.VALEUR_BRUTE}
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="DATE_ACQUISITION "
                                frozen
                                header="Date d'acquisition"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.DATE_ACQUISITION}
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="DUREE_VIE "
                                frozen
                                header="Dure de vie"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.DUREE_VIE}
                                        </span>
                                    );
                                }}
                            />


                            <Column
                                field="AMORTISSEMENT_CUMULE "
                                frozen
                                header="Amortissement cumule"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.AMORTISSEMENT_CUMULE ? parseInt(item.AMORTISSEMENT_CUMULE).toLocaleString('fr-FR') : 0} Fbu
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="VALEUR_NETTE "
                                frozen
                                header="Valeur net"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.VALEUR_NETTE ? parseInt(item.VALEUR_NETTE).toLocaleString('fr-FR') : 0} Fbu
                                        </span>
                                    );
                                }}
                            />

                            {/* {item.CREDIT ? parseInt(item.CREDIT).toLocaleString('fr-FR') : 0} Fbu */}





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
