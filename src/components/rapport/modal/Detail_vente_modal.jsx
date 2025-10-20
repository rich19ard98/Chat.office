import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import moment from "moment";

import { ProgressSpinner } from "primereact/progressspinner";
import fetchApi from "../../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../../components/app/Loading";
import { Image } from "primereact/image";
import { InputSwitch } from "primereact/inputswitch";
import { Tooltip } from "primereact/tooltip";
import { encodeId } from "../../../utils/IdEncryption";
import { userSelector } from "../../../store/selectors/userSelector";
import { Dropdown } from "primereact/dropdown";

export default function Detail_vente_modal() {
  const [ldetails, setLdetails] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(1);
  const [cmdClient, setCmdClient] = useState([]);
  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);

  const user = useSelector(userSelector);
  const [refvente, setRefvente] = useState([]);
  const [referencedata, setReferencedata] = useState(null);

  const navigate = useNavigate();

  const [lazyState, setLazyState] = useState({
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

  const handleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const onPage = (event) => {
    setLazyState((prev) => ({ ...prev, ...event }));
  };

  const onSort = (event) => {
    setLazyState((prev) => ({ ...prev, ...event }));
  };

  const onFilter = (event) => {
    setLazyState((prev) => ({ ...prev, ...event, first: 0 }));
  };

  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedItems(value);
    setSelectAll(value.length === totalRecords);
  };

  const onSelectAllChange = (event) => {
    const selectAllChecked = event.checked;
    setSelectAll(selectAllChecked);
    setSelectedItems(selectAllChecked ? cmdClient : []);
  };

  const referenceVenteselected = async (prof) => {
    setReferencedata(prof);
  };

  const fetchReferenceNumero = useCallback(async () => {
    try {
      const url = `/Ventes/Ventes/fetchVente?idUser=${user.ID_UTILISATEUR}&rows=1000000&`;
      const Reponses = await fetchApi(url);
      setRefvente(
        Reponses.result.data.map((util) => ({
          name: util.NUMERO_VENTE,
          code: util.ID_VENTE,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  }, [user.ID_UTILISATEUR]);

  useEffect(() => {
    fetchReferenceNumero();
  }, [fetchReferenceNumero]);

  const fetchstockmp = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/Ventes/Ventes/fetchDetailvente?userId=${user.ID_UTILISATEUR}&`;
      for (const key in lazyState) {
        const value = lazyState[key];
        if (value !== undefined && value !== null) {
          if (typeof value === "object" && !Array.isArray(value)) {
            url += `${key}=${encodeURIComponent(JSON.stringify(value))}&`;
          } else {
            url += `${key}=${encodeURIComponent(value)}&`;
          }
        }
      }
      if (referencedata) {
        url += `referencedata=${referencedata.code}&`;
      }
      const res = await fetchApi(url);
      setCmdClient(res.result.data);
      setTotalRecords(res.result.totalRecords);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, referencedata, user.ID_UTILISATEUR]);

  useEffect(() => {
    fetchstockmp();
  }, [fetchstockmp]);

  useEffect(() => {
    document.title = "Detail vente";
    dispatch(
      setBreadCrumbItemsAction([
        {
          path: "ventDetail",
          name: "Detail vente",
        },
      ])
    );
    return () => {
      dispatch(setBreadCrumbItemsAction([]));
    };
  }, [dispatch]);

  const totalValue = cmdClient.reduce((total, commande) => {
    if (commande?.QUANTITE && commande?.PRIX_UNIT) {
      return (
        total + parseFloat(commande.QUANTITE) * parseFloat(commande.PRIX_UNIT)
      );
    }
    return total;
  }, 0);

  const formattedTotal = `${totalValue.toLocaleString("fr")}`;

  const totalValueAchat = cmdClient.reduce((total, commande) => {
    if (commande?.QUANTITE && commande?.PRIX_ACHAT) {
      return (
        total + parseFloat(commande.QUANTITE) * parseFloat(commande.PRIX_ACHAT)
      );
    }
    return total;
  }, 0);

  const formattedTotalAchat = `${totalValueAchat.toLocaleString("fr")}`;

  return (
    <>
      <ConfirmDialog closable dismissableMask={true} />
      {globalLoading && <Loading />}
      <div className="px-4 py-3 main_content">
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="mb-3">Détail de la vente des Accessoires</h3>
        </div>
        <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
          <div className="d-flex  align-items-center">
            <div className="mb-4">
              <span className="p-input-icon-left">
                <i className="pi pi-search mt-1" />
                <InputText
                  value={lazyState.search}
                  onChange={(e) =>
                    setLazyState((prev) => ({
                      ...prev,
                      search: e.target.value,
                      first: 0,
                    }))
                  }
                  className="mt-4"

                  placeholder="Rechercher..."
                />
              </span>
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
                className="w-full md:w-15rem mx-1 no-p"
                showClear
              />
            </div>

            <div className="selection-actions d-flex align-items-right">
              <div className="row justify-content-center">
                <div className="text-muted mx-2">
                  <strong className="ml-4">M.T.A</strong>
                </div>
                <span className="p-menuitem-text ">
                  <strong className=" ml-2 " style={{ color: "blue" }}>
                    {formattedTotalAchat} FBU
                  </strong>
                </span>
              </div>

              {/* <div className="selection-actions d-flex align-items-right"> */}
              <div className="row justify-content-center">
                <div className="text-muted mx-2">
                  <strong className="ml-4">M.T.V</strong>
                </div>
                <span className="p-menuitem-text ">
                  <strong className=" ml-2 " style={{ color: "blue" }}>
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
            <div style={{ maxHeight: "400px", overflowY: "hidden" }}> {/* Wrapper to prevent vertical scroll */}
              <DataTable
                lazy
                value={cmdClient}
                tableStyle={{ minWidth: "80rem" }}
                className=""
                size="small"
                paginator
                rows={lazyState.rows}
                rowsPerPageOptions={[10, 25, 50, 250, 500, 1000]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate={`{first} - {last} dans ${totalRecords} éléments`}
                emptyMessage="Aucun élément trouvé"
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
                scrollable // Keep this for horizontal scroll only
              >
                <Column
                  field="accessoires"
                  header="Accessoires"
                  frozen
                  sortable
                  body={(item) => {
                    const css = `
                            .round-indicator .p-image-preview-indicator {
                                border-radius: 50%;
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
                            parseFloat(item.QUANTITE) *
                            parseInt(item.PRIX_ACHAT)
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
                  field="DATE_INSERTION"
                  header="Date de vente"
                  sortable
                  body={(item) => {
                    return moment(item.DATE_INSERTION).format("DD/MM/YYYY HH:mm");
                  }}
                />
              </DataTable>
            </div> {/* End of wrapper */}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
