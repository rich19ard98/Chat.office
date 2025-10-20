import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import IDS_ROLES from "../../constants/IDS_ROLES";
import { userSelector } from "../../store/selectors/userSelector";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";


export default function Parametre_liste_page() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [parametre, setParametre] = useState([]);
  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);
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
      setSelectedItems(statutscredit);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };



  const fetchParametres_financiers = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/credits/parametres_financiers/fetch?`;
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

      setParametre(res.result.data);
      setTotalRecords(res.result.totalRecords);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);


  useEffect(() => {
    fetchParametres_financiers();
  }, [lazyState]);


  useEffect(() => {
    document.title = "Liste"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'parametres_financiers',
        name: 'Liste'
      },

    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);
  const IsGerant = user.ID_PROFIL === PROFILS.GERANT
const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT
  const parametrePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PARAMETRE)
  const paramAcces = parametrePermission && (parametrePermission.CAN_READ || parametrePermission.CAN_WRITE)
  if (!paramAcces && !IsGerant && !IsAdminAjoin) {
    return <NotFound />
  }
  return (
    <>
      <ConfirmDialog closable dismissableMask={true} />
      {globalLoading && <Loading />}
      <div className="px-4 py-3 main_content">
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="mb-3">Paramètre</h1>

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
              value={parametre}
              tableStyle={{ minWidth: "50rem" }}
              className=""
              paginator
              size="small"
              rowsPerPageOptions={[5, 10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate={` {first} - {last} dans ${totalRecords} éléments`}
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
                field="NOM_PARAMETRE"
                header="Nom Parametre"
                sortable
                body={(item) => {
                  return (
                    <span>
                      {item?.NOM_PARAMETRE}
                    </span>
                  );
                }}
              />
              <Column
                field="VALEUR"
                frozen
                header="Valeur parametre"
                sortable
                body={(item) => {
                  return (
                    <span>
                      {item.VALEUR}
                    </span>
                  );
                }}
              />
              <Column
                field="DESCRIPTION"
                header="Description"
                sortable
                body={(item) => item.DESCRIPTION}
              />
              <Column
                field="DATE_MISE_A_JOUR"
                header="date "
                sortable
                body={(item) => {
                  const date = new Date(item.DATE_MISE_A_JOUR);
                  return date.toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',

                  })
                }}

              />
              {parametrePermission && parametrePermission.CAN_WRITE ?
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
                              to={`/parametres_financiers/edit/${inViewMenuItem?.ID_PARAMETRE}`}
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

                    ];
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
      </div>
      <Outlet />
    </>
  );
}
