import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../store/actions/appActions";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dialog } from "primereact/dialog";

import { userSelector } from "../../store/selectors/userSelector";
import administration_routes from "../../routes/admin/administration_routes";
import Signatureelectroniqueobr from "./signatureelectroniqueob";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
/**
* Récupérer toutes les classes comptables
* @date  15/04/2025
* @param {express.Request} req 
* @param {express.Response} res 
* @author rosine <gahimbarerosine9@gmail.com>
*/
export default function Classecomptable_liste_page() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [classecomptable, setClassecomptable] = useState([]);
  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [descriptionclasse, setdescriptionclasse] = useState(false);
  const [permissions, setPermissions] = useState(false);
  const [persmissiondata, setPersmissiondata] = useState(null);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');

  const user = useSelector(userSelector)
  // console.log(user);
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
      setSelectedItems(classecomptable);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };

  const deleteItems = async (itemsIds) => {
    try {
      setGloabalLoading(true);
      const form = new FormData();
      form.append("ID_CLASSE_COMPTABLE", JSON.stringify(itemsIds));
      const res = await fetchApi("/plancomptable/classcomptable/detele_classecompable", {
        method: "post",
        body: form,
      });
      dispacth(
        setToastAction({
          severity: "success",
          summary: "classe comptable supprimé",
          detail: "La classe comptable a été supprimé avec succès",
          life: 3000,
        })
      );
      fetchClassecomptable();
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


              <div className="font-bold text-center my-2">
                {inViewMenuItem?.Nom}
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


  const fetchClassecomptable = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/plancomptable/classcomptable/fetch?rows=100000000000&`;
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
      setClassecomptable(res.result.data)
      setTotalRecords(res.result.totalRecords);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);



  useEffect(() => {
    fetchClassecomptable();
  }, [lazyState]);



  useEffect(() => {
    document.title = "Classe comptable"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'classecomptable',
        name: 'Classe comptable'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);
  const IsGerant = user.ID_PROFIL === PROFILS.GERANT
const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT
  const plancomptablePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PLANCOMPTABLE)
  const planAcces = plancomptablePermission && (plancomptablePermission.CAN_READ || plancomptablePermission.CAN_WRITE)
  if (!planAcces && !IsGerant && !IsAdminAjoin) {
    return <NotFound />
  }
  return (
    <>
      <ConfirmDialog closable dismissableMask={true} />
      {globalLoading && <Loading />}
      <div className="px-4 py-3 main_content">
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="mb-3">Classe comptable</h1>

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

          {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
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
                    selectedItems.map((item) => item.ID_CLASSE_COMPTABLE)
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
              value={classecomptable}
              tableStyle={{ minWidth: "50rem" }}
              className=""
              paginator
              size="small"
              rowsPerPageOptions={[5, 10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate={` {first} - {last} dans ${totalRecords} éléments`}
              emptyMessage="Aucun Classe comptable trouvé"
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
                field="ID_CLASSE_COMPTABLE"
                frozen
                header="#"
                sortable
                body={(item) => {
                  return (
                    <span>
                      {item.ID_CLASSE_COMPTABLE}
                    </span>
                  );
                }}
              />
              <Column
                field="NOM_CLASSE"
                frozen
                header="Nom"
                sortable
                body={(item) => {
                  return (
                    <span>{item.NOM_CLASSE || '-'}</span>
                  );
                }}
              />

              <Column
                field="DESCRIPTION"
                header="Description"
                sortable
                body={(item) => (
                  item?.DESCRIPTION ? (
                    <span
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDescriptionText(item);
                        setDescriptionVisible(true);
                      }}
                      title="Voir la description complète"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red"
                        className="bi bi-eye text-secondary" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 
          5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 
          1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                      </svg>
                    </span>
                  ) : '-'
                )}
              />

              <Column
                field="CLASSE_POUR"
                frozen
                header="Classe"
                sortable
                body={(item) => {
                  return (
                    <span>
                      {item.CLASSE_POUR}
                    </span>
                  );
                }}
              />
              {plancomptablePermission && plancomptablePermission.CAN_WRITE ?
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
                              to={`/classecomptable/edit/${inViewMenuItem?.ID_CLASSE_COMPTABLE}`}
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
                      {
                        template: (deleteItem, options) => {
                          return (
                            <a
                              href="#"
                              className="p-menuitem-link text-danger"
                              onClick={(e) =>
                                handleDeletePress(e, [
                                  inViewMenuItem.ID_CLASSE_COMPTABLE,
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


                    ];
                    return (
                      <>
                        <SlideMenu
                          ref={menu}
                          model={items}
                          popup
                          viewportHeight={100}
                          menuWidth={200}
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
                            setPersmissiondata(item);
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
            <Dialog
              headerStyle={{ backgroundColor: '#ecc5c5', backgroundSize: 'cover' }}
              headerClassName="text-black"
              header={`Description de la classe : ${descriptionText?.NOM_CLASSE || ''}`}

              //header="Description"
              visible={descriptionVisible}
              style={{ width: '50vw' }}
              onHide={() => setDescriptionVisible(false)}
            >
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: '1.5' }}>
                {descriptionText?.DESCRIPTION || "Aucune description disponible."}
              </div>
            </Dialog>


          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
