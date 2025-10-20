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
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
// import Frais_adhesion_add_page from "./Frais_adhesion_add_page";
import { userSelector } from "../../store/selectors/userSelector";


export default function Bilans_liste_page() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const user = useSelector(userSelector);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [bilans, setBilan] = useState([]);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [activeButton, setActiveButton] = useState(1)
    const [afficheFrais, setAfficheFrais] = useState(1)
    const [periode, setPeriode] = useState(null)
    const navigate = useNavigate();

    const [totalvaleurAmortissement, setTotalvaleurAmortissement] = useState(null)
    const [totalActif, setTotalActif] = useState(null)
    const [creance, setCreance] = useState(null)
    const [banque, setBanque] = useState(null)
    const [caisse, setCaisse] = useState(null)
    const [valeurbrute, setValeur_brutte] = useState(null)
    const [totalresultant, setTotalresultant] = useState(null)
    const [valeurnette, setValeur_nette] = useState(null)
    const [totalcaisse_social, setTotalcaisse_social] = useState(null)
    const [total_passif, setTotal_passif] = useState(null)
    const [montResiduel, setMontResiduel] = useState(null)
    const [totalCapital, setTotalCapital] = useState(null)

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
    const fetchBilan = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/bilan/bilan/fetch?`;

            var url = baseurl;


            const res = await fetchApi(url);
            setBilan(res.result.data)
setTotalRecords(res.result.totalRecords)



        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, type, periode]);
    // console.log(creance,"kjdkkdk")

    useEffect(() => {
        fetchBilan();
    }, [lazyState, type, periode]);

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
    return (
        <>
            <ConfirmDialog closable dismissableMask={true} />
            {globalLoading && <Loading />}

            <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h1 className="mb-3">Liste des bilans</h1>
                    {/* <Button
                                  label="Nouveau"
                                  icon="pi pi-plus"
                                  size="small"
                                  onClick={
                                      handlAddPageFrais}
                              /> */}
                    {/* <Button
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
                      </Button> */}

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
                        {/* <div className="p-input-icon-left ml-1">
                              <Dropdown
                                  value={type}
                                  onChange={(e) => typeSelected(e.value)}
                                  options={types}
                                  filter
                                  filterBy="name"
                                  optionLabel="name"
                                  placeholder="Types"
                                  className="w-full md:w-10rem mx-3 no-p"
                                  showClear
                              />
                          </div>
                           <div className="p-input-icon-left ml-1">
                              <Dropdown
                                  value={periode}
                                  onChange={(e) => periodesSelected(e.value)}
                                  options={period}
                                  filter
                                  filterBy="name"
                                  optionLabel="name"
                                  placeholder="Periodes"
                                  className="w-full md:w-10rem mx-3 no-p"
                                  showClear
                              />
                          </div> */}

                    </div>


                    {/* <div className="p-input-icon-left ml-3">
  
                       
                      </div> */}
                </div>
                <div className="content">
                    <div className="shadow rounded mt-3 pr-1 bg-white">
                        <DataTable
                            lazy
                            size={'small'}
                            value={bilans}
                            // showGridlines
                            tableStyle={{ minWidth: "50rem" }}
                            className=""
                            paginator
                            rowsPerPageOptions={[5, 10, 25, 50]}
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
                                                id={`custom-tooltip-btn_demdd-${item?.ID_BILAN}`}
                                                className=" text-decoration-none d-flex round-indicator"
                                                style={{ color: '#399af2' }}
                                                to={`/bilan/details?id=${item?.ID_BILAN}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                data-pr-position="bottom"
                                            >
                                                <div className="d-flex round-indicator">

                                                    <div className="ml-2 mt-1">
                                                        <div className="font-bold">
                                                            {item?.REF}
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
                                header="Type"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.utilisateur?.USERNAME}
                                        </span>
                                    );
                                }}
                            />

                            <Column
                                field="DATE_BILAN "
                                frozen
                                header="Date du bilan"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item?.DATE_BILAN}
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="TOTAL_ACTIF "
                                frozen
                                header="Total actif"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.TOTAL_ACTIF ? parseInt(item.TOTAL_ACTIF).toLocaleString('fr-FR') : 0} Fbu

                                        </span>
                                    );
                                }}
                            />


                            <Column
                                field="TOTAL_PASSIF "
                                frozen
                                header="Total passif"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.TOTAL_PASSIF ? parseInt(item.TOTAL_PASSIF).toLocaleString('fr-FR') : 0} Fbu
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                field="ECART "
                                frozen
                                header="Ecart"
                                sortable
                                body={(item) => {
                                    return (
                                        <span>
                                            {item.ECART ? parseInt(item.ECART).toLocaleString('fr-FR') : 0} Fbu
                                        </span>
                                    );
                                }}
                            />


                            {/* {item.CREDIT ? parseInt(item.CREDIT).toLocaleString('fr-FR') : 0} Fbu */}







                        </DataTable>
                    </div>
                </div >
            </div >
            <Outlet />


        </>
    );


}