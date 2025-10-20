import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import fetchApi from "../../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../../components/app/Loading";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { encodeId } from "../../../utils/IdEncryption";
import { userSelector } from "../../../store/selectors/userSelector";
import { Dropdown } from "primereact/dropdown";


export default function Detail_venteproduitsparheure_Liste_modal_page({ dates, datespardates, heure, statuts, dateSelected }) {
    // return console.log(heure,'datespardatesdatespardates');
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(1);
    const [cmdClient, setCmdClient] = useState([]);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const user = useSelector(userSelector)
    const [refvente, setRefvente] = useState([])
    const [referencedata, setReferencedata] = useState(null)

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
            setSelectedItems(cmdaprovision);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };
    const referenceVenteselected = async (prof) => {
        setReferencedata(prof);
    };

    // fonction pour lister les utilisateurs
    const fetchReferenceNumero = useCallback(async () => {
        try {
            var url = `/ventes/vente/fetch?idUser=${user.ID_UTILISATEUR}&rows=1000000&`
            const res = await fetchApi(url);
            setRefvente(
                res.result.data.map((util) => {
                    return {
                        name: util.NUMERO_VENTE,
                        code: util.ID_VENTE,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchReferenceNumero();
    }, []);

    const fetchstockmp = useCallback(async () => {
        try {
            setLoading(true);
            // const datestring = dates ? dates.toString() : (new Date()).toString()
            // const baseurl = `/ventes/vente/fetchDetailvente?userId=${user.ID_UTILISATEUR}&startDate=${datestring}&endDate=${datestring}&idgenerique=${idStatut}&`;

            const baseurl = `/Ventes/Ventes/fetchDetailvente?userId=${user.ID_UTILISATEUR}&`;

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
            if (referencedata) {
                url += `isreferencedata=${referencedata.code}&`;
            }
            if (statuts) {
                url += `StatutVENTE=${JSON.stringify(statuts)}&`;
            }
            if (heure) {
                url += `heure=${heure}&`
            }
            if (dates) {
                const startDate = dates;
                if (startDate) {
                    url += `startDate=${startDate.toString()}&`;
                }
                const endDate = dates;
                if (endDate) {
                    url += `endDate=${endDate.toString()}&`;
                }
            }
            const res = await fetchApi(url);
            console.log(res, 'resres');
            setCmdClient(res.result.data);
            setTotalRecords(res.result.totalRecords);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, referencedata, dates, heure]);

    useEffect(() => {
        fetchstockmp();
    }, [lazyState, referencedata, dates, heure]);



    useEffect(() => {
        document.title = "Detail vente"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'ventDetail',
                name: 'Detail vente'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);




    //calcule du montant total
    const totalValue = cmdClient.reduce((total, commde) => {
        if (commde && commde.QUANTITE && commde.PRIX_UNIT) {
            return total + parseFloat(commde.QUANTITE) * parseFloat(commde.PRIX_UNIT
            );
        }
        return total;
    }, 0);

    const formattedTotal = totalValue !== null ? totalValue.toLocaleString('fr') : '';

    const totalValueAchat = cmdClient.reduce((total, commde) => {
        if (commde && commde.QUANTITE && commde.PRIX_ACHAT) {
            return total + parseFloat(commde.QUANTITE) * parseFloat(commde.PRIX_ACHAT);
        }
        return total;
    }, 0);

    const formattedTotalAchat = totalValueAchat !== null ? totalValueAchat.toLocaleString('fr') : '';

    return (
        <>
            {/* <ConfirmDialog closable dismissableMask={true} /> */}
            {globalLoading && <Loading />}
            {/* <div className="px-4 py-3 main_content">
                <div className="d-flex align-items-center justify-content-between">
                    <h3 className="mb-3">Détail de la vente des médicaments</h3>
                </div> */}
            <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                <div className="d-flex  align-items-center">
                    <div className="p-input-icon-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-search" viewBox="0 0 16 16">
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
                    <div className="p-input-icon-left ml-1">
                        <Dropdown
                            value={referencedata}
                            onChange={(e) => referenceVenteselected(e.value)}
                            options={refvente}
                            filter
                            filterBy="name"
                            optionLabel="name"
                            placeholder="Réference vente"
                            className="w-full md:w-15rem mx-6 no-p"
                            showClear
                        />
                    </div>

                    <div className="selection-actions d-flex align-items-right">
                        <div className="row justify-content-center">
                            <div className="text-muted mx-6">
                                <strong className="ml-4">M.T.A</strong>
                            </div>
                            <span className="p-menuitem-text ">
                                <strong className=" ml-2 " style={{ color: 'blue' }}>
                                    {formattedTotalAchat} FBU
                                </strong>
                            </span>
                        </div>

                        {/* <div className="selection-actions d-flex align-items-right"> */}
                        <div className="row justify-content-center">
                            <div className="text-muted mx-6">
                                <strong className="ml-4">M.T.V</strong>
                            </div>
                            <span className="p-menuitem-text ">
                                <strong className=" ml-2 " style={{ color: 'blue' }}>
                                    {formattedTotal} FBU
                                </strong>
                            </span>
                        </div>
                        {/* </div> */}
                    </div>

                </div>

            </div>
            <div className="content">
                <div className="shadow rounded mt-3 pr-1 bg-white">
                <DataTable
              lazy
              value={cmdClient}
              tableStyle={{ minWidth: "50rem" }}
              className=""
              size="small"
              paginator
              rows={lazyState.rows}
              rowsPerPageOptions={[10, 25, 50, 250, 500, 1000]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate={`{first} - {last} dans ${totalRecords} éléments`}
              emptyMessage="Aucun élément trouvé"
              //   paginatorLeft={paginatorLeft}
              //   paginatorRight={paginatorRight}
              first={lazyState.first}
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
                field="accessoires"
                header="Accessoires"
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
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: "#ccc",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "black",
                            fontWeight: "bold",
                          }}
                        >
                          {item?.stockV?.accessoires?.NOM_ACCESSOIRE.charAt(0)}
                        </div>
                        <div className="ml-2">
                          <div className="font-bold">
                            {item?.stockV?.accessoires
                              ? item?.stockV?.accessoires?.NOM_ACCESSOIRE
                              : "-"}
                          </div>
                        </div>
                      </div>
                      <style>{css}</style>
                    </>
                  );
                }}
              />
              <Column
                field="QUANTITE"
                header="Quantité"
                headerStyle={{ fontSize: 14 }}
                body={(item) => {
                  return item.QUANTITE !== 0 ? (
                    <span>
                      {item?.QUANTITE
                        ? parseFloat(item?.QUANTITE).toLocaleString("fr")
                        : 0}{" "}
                      {item?.stockV?.accessoires?.CONDITIONNEMENT}
                    </span>
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                field="price"
                header="P.A.U"
                headerStyle={{ fontSize: 14 }}
                body={(item) => (
                  <span>
                    {parseFloat(item.PRIX_ACHAT).toLocaleString("fr")} Fbu
                  </span>
                )}
              />
              <Column
                field="MONTANT_MINUTE"
                header="P.A.T"
                headerStyle={{ fontSize: 14 }}
                body={(item) => {
                  return item.PRIX_ACHAT !== 0 ? (
                    <span>
                      {item?.QUANTITE && item?.PRIX_ACHAT
                        ? (
                          parseFloat(item?.QUANTITE) *
                          parseInt(item?.PRIX_ACHAT)
                        ).toLocaleString("fr")
                        : 0}{" "}
                      Fbu
                    </span>
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                field="price"
                header="P.V.U"
                headerStyle={{ fontSize: 14 }}
                body={(item) => (
                  <span>
                    {parseFloat(item.PRIX_UNIT).toLocaleString("fr")} Fbu
                  </span>
                )}
              />

              <Column
                field="MONTANT_MINUTE"
                header="P.V.T"
                headerStyle={{ fontSize: 14 }}
                body={(item) => {
                  return item.PRIX_UNIT !== 0 ? (
                    <span>
                      {item?.QUANTITE && item?.PRIX_UNIT
                        ? (
                          parseFloat(item?.QUANTITE) *
                          parseInt(item?.PRIX_UNIT)
                        ).toLocaleString("fr")
                        : 0}{" "}
                      Fbu
                    </span>
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                field="DATE_INSERTION "
                header="Date de vente"
                sortable
                body={(item) => {
                  return moment(item.DATE_INSERTION).format("DD/MM/YYYY HH:mm");
                }}
              />
            </DataTable>
                </div>
            </div >
            {/* </div > */}
            <Outlet />
        </>
    );
}
