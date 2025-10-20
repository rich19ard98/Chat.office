import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dialog } from "primereact/dialog";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import subText from "../../helpers/subText";
import { userSelector } from "../../store/selectors/userSelector";
import Detailmembre from "./Detailmembre";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
// import Detaildriver from "../../components/notification/detaildriver";

const DriverSwitch = ({ driver: sessiondriver, change_status, disabled }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(!!sessiondriver?.IS_ACTIVE);
  }, [sessiondriver]);

  return (
    <InputSwitch
      checked={checked}
      disabled={disabled} // ← désactive le switch si pas de permission
      onChange={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return; // Sécurité : empêche toute action
        setChecked(e.value);
        change_status(null, sessiondriver?.ID_NOTIFICATION_TOKEN);
      }}
    />
  );
};


const DriverSwitchNotWrite = ({ driver: sessiondriver }) => {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    if (sessiondriver.IS_ACTIVE) {
      setChecked(true)
    } else {
      setChecked(false)
    }
  }, [sessiondriver])
  return (
    <InputSwitch checked={checked} />
  )
}


/**
 * fonction pour lister les sessions des membres
 * @author leonard <leohab@inoviatech.com>
 * @date 1/07/2025
 */

export default function Session_membre_liste_page() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(1);
  const [sessionchauffeur, setSessionchauffeur] = useState([]);
  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [sessiondriverstatut, setSessiondriverstatut] = useState(null);
  const [driverselect, setDriverselect] = useState(null);
  const [driverdata, setDriverdata] = useState([]);
  const [detail, setDetail] = useState(false);
  const [displayNotificationBasic, setDisplaynotificationBasic] = useState(false);
  const [onenotification, setOnenotification] = useState(null);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true)
  const [driverSearch, setDriverSearch] = useState("")
  const navigate = useNavigate();
  const user = useSelector(userSelector);


  //etat pour les filtres les sessions d'un chauffeur activee /desactivee
  const [statut_data, setStatut] = useState([{
    code: 2,
    name: `Tous`
  }, {
    code: 1,
    name: `Active`
  }, {
    code: 0,
    name: `Desactive`
  }]);



  const statutSelected = async (statut) => {
    setSessiondriverstatut(statut);
  };

  const driverSeletcted = async (driver) => {
    setDriverselect(driver);
  };

  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: "",
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
      setSelectedItems(sessionchauffeur);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };


  //fonction pour lister les membre dans un dropdown la filtre d'un session
  const fetchallutilisateur = useCallback(async () => {
    try {
      setIsLoadingDrivers(true)
      var url = `/administration/utilisateurs/fetch?rows=1000000&idmembre__notnull=0`
      if (driverSearch.trim() != "") {
        url += `search=${driverSearch}`
      }
      const res = await fetchApi(url);
      setDriverdata(
        res.result.data.map((util) => {
          return {
            name: [util.NOM + ' ' + util.PRENOM],
            code: util.ID_UTILISATEUR,
          };
        })
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingDrivers(false)
    }
  }, [driverSearch]);

  useEffect(() => {
    fetchallutilisateur();
  }, [driverSearch]);



  //fonction pour faire une suppression d'une session d'un membre

  const deleteItems = async (ID_NOTIFICATION_TOKEN) => {
    try {
      setGloabalLoading(true);
      const form = new FormData();
      form.append("ids", JSON.stringify(ID_NOTIFICATION_TOKEN));
      const res = await fetchApi("/administration/sessionsmembre/deleteusers", {
        method: "POST",
        body: form,
      });
      navigate("/Sessionmembres");
      dispacth(
        setToastAction({
          severity: "success",
          summary: "Session d'un membre supprimée",
          detail: "La session d'un membre a été supprimée avec succès",
          life: 3000,
        })
      );
      fetchsessionchauffeur();
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

  //evenement pour la suppression d'une session d'un chauffeur
  const handleDeletePress = (e, ID_NOTIFICATION_TOKEN) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Supprimer",
      message: (
        <div className="d-flex flex-column align-items-center">
          {inViewMenuItem ? (
            <>
              <div className="font-bold text-center my-2">
                {inViewMenuItem?.utilisateursmembre.NOM} {inViewMenuItem?.utilisateursmembre.PRENOM}
              </div>
              <div className="text-center">
                Voulez-vous vraiment supprimer ?
              </div>
            </>
          ) : (

            <>
              <div className="text-muted">
                {selectedItems ? selectedItems.length : "0"}selectionné
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
      acceptLabel: `Oui`,
      rejectLabel: `Non`,
      accept: () => {
        deleteItems(ID_NOTIFICATION_TOKEN);
      },
    });
  };



  //fonction pour la desactivation et l'activation d'un statut d'une session du membre

  const change_status = async (e, ID_NOTIFICATION_TOKEN) => {
    try {
      setGloabalLoading(true);
      await fetchApi(
        `/administration/sessionsmembre/change_statuts/${ID_NOTIFICATION_TOKEN}`,
        {
          method: "PUT",
        }
      );
      fetchsessionchauffeur();
    } catch (error) {
      console.log(error);
    } finally {
      setGloabalLoading(false);
      menu.current.hide(e);
    }
  };



  //fonction pour lister les session d'un chauffeur
  const fetchsessionchauffeur = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/administration/sessionsmembre/fetchallsession?`;
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
      if (sessiondriverstatut) {
        url += `DriverStatut=${sessiondriverstatut.code}&`;
      }

      if (driverselect) {
        url += `driver=${driverselect.code}&`;
      }

      const res = await fetchApi(url);
      setSessionchauffeur(res.result.data);
      setTotalRecords(res.result.totalRecords);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, sessiondriverstatut, driverselect]);


  useEffect(() => {
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'Sessionmembres',
        name: 'Sessions des membres'
      },

    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);


  useEffect(() => {
    document.title = `Sessions des membres`,
      fetchsessionchauffeur();
  }, [lazyState, sessiondriverstatut, driverselect]);


  const IsGerant = user.ID_PROFIL === PROFILS.GERANT
const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT
  const adminPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.ADMINISTRATION)
  const adminAcces = adminPermission && (adminPermission.CAN_READ || adminPermission.CAN_WRITE)
  if (!adminAcces && !IsGerant && !IsAdminAjoin) {
    return <NotFound />
  }

  return (
    <>
      {/* <ConfirmDialog closable dismissableMask={true} /> */}
      {globalLoading && <Loading />}
      <div className="px-4 py-3 main_content">
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="mb-3">Sessions des membres</h1>
        </div>

        <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
          <div className="d-flex  align-items-center">
            <div className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                type="search"
                placeholder="Recherche"
                className="p-inputtext-sm"
                style={{ minWidth: 170 }}
                onInput={(e) =>
                  setlazyState((s) => ({ ...s, search: e.target.value }))
                }
              />
            </div>
            <div className="p-input-icon-left ml-3">

              <Dropdown
                value={driverselect}
                onChange={(e) => driverSeletcted(e.value)}
                options={driverdata}
                filter
                filterBy="name"
                optionLabel="name"
                placeholder="Membre"
                className="w-full md:w-14rem mx-2 no-p"
                showClear
                onFilter={e => {
                  setDriverSearch(e.originalEvent.target.value)
                }}
                filterIcon={isLoadingDrivers ? "pi pi-spin pi-spinner" : undefined}
              />

            </div>
            <div className="p-input-icon-left ml-1">
              <Dropdown
                value={sessiondriverstatut}
                onChange={(e) => statutSelected(e.value)}
                options={statut_data}
                filter
                filterBy="name"
                optionLabel="name"
                placeholder="Statut"
                className="w-full md:w-10rem mx-3 no-p"
                showClear
              />
            </div>


          </div>
          {adminPermission && adminPermission.CAN_WRITE ?
            <div className="selection-actions d-flex align-items-center">
              <div className="text-muted mx-3">

                {selectedItems?.length > 0
                  ? `${selectedItems.length} ${selectedItems.length > 1 ? 'sélectionnés' : 'sélectionné'}`
                  : ''}

              </div>

              <a
                href="#"
                className={`p-menuitem-link link-dark text-decoration-none mr-2 ${(!selectedItems || selectedItems?.length == 0) &&
                  "opacity-50 pointer-events-none"
                  }`}
                style={{}}
                onClick={(e) =>
                  handleDeletePress(
                    e,
                    selectedItems.map((item) => item.ID_NOTIFICATION_TOKEN)
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


              <Button disabled={loading} onClick={e => {
                e.preventDefault()
                fetchsessionchauffeur();
              }} type="button" icon={options => {
                return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16" {...options.iconProps}>
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                  <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                </svg>
              }} outlined className="py-2" data-pr-tooltip="Rafflaichir" tooltip tooltipOptions={{ position: 'bottom' }} />
            </div>

            : null}
        </div>


        <div className="content">
          <div className="shadow rounded mt-3 pr-1 bg-white">
            <DataTable
              lazy
              value={sessionchauffeur}
              tableStyle={{ minWidth: "50rem", fontSize: 14 }}
              className=""
              paginator
              size="small"
              rowsPerPageOptions={[5, 10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate={` {first} - {last} dans ${totalRecords} éléments`}
              emptyMessage="Aucun membres trouvé"
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
                selectionMode="multiple"
                frozen
                headerStyle={{ width: "3rem" }}
              />

              <Column
                field="IMAGE"
                header="Membre"
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

                        {item.utilisateursmembre?.IMAGE ? (
                          <Image
                            src={item?.utilisateursmembre?.IMAGE}
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
                            {item?.utilisateursmembre?.NOM.charAt(0)}{item?.utilisateursmembre?.PRENOM.charAt(0)}
                          </div>
                        )}
                        <div className="ml-2">
                          <div className="font-bold">
                            {item.utilisateursmembre.NOM} {item.utilisateursmembre.PRENOM}
                          </div>
                          <div className="text-muted">{item.utilisateursmembre.TELEPHONE}</div>
                        </div>
                      </div>
                      <style>{css}</style>
                    </>
                  );
                }}
              />



              <Column
                field="osName"
                header="Systeme d'exploitation"
                sortable
                body={(item) => {
                  return <span>{item.osName ? subText(item.osName, 10, false) : "-"}</span>;
                }}
              />
              <Column
                field="brand"
                header="Marque"
                sortable
                body={(item) => {
                  return <>{item ? <span>{item.brand ? item.brand : '-'}</span> : "-"}</>
                }}
              />
              <Column
                field="modelName"
                header="Modele"
                sortable
                body={(item) => {
                  return <span>{item.modelName ? item.modelName : '-'}</span>;
                }}
              />


              <Column
                field="IS_ACTIVE"
                header="Statut"
                frozen
                sortable
                body={(item) => (
                  <DriverSwitch
                    driver={item}
                    change_status={change_status}
                    disabled={!adminPermission?.CAN_WRITE} // ← Contrôle d'accès
                  />
                )}
              />


              <Column
                field="DATE_INSERTION"
                header="Date"
                sortable
                body={(item) => {
                  return moment(item.DATE_INSERTION).format("DD/MM/YYYY HH:ss");
                }}
              />


              {adminPermission && adminPermission.CAN_WRITE ?
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
                              to={`#`}
                              className="p-menuitem-link"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                // setOnenotification(item);
                                setDetail(true);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-list"
                                viewBox="0 0 16 16"
                                style={{ marginRight: "0.5rem" }}
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                                />
                              </svg>
                              <span className="p-menuitem-text">Plus de détail </span>
                            </Link>
                          );
                        },
                      },

                      {
                        template: (deleteItem, options) => {

                          if (inViewMenuItem?.TOKEN != null && inViewMenuItem?.IS_ACTIVE != 0) {
                            return (
                              <Link
                                to={`#`}
                                className="p-menuitem-link"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  setDisplaynotificationBasic(true);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-bell"
                                  viewBox="0 0 16 16"
                                  style={{ marginRight: "0.5rem" }}
                                >
                                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                                </svg>
                                <span className="p-menuitem-text">Envoyer notification</span>
                              </Link>
                            );
                          }

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
                                  inViewMenuItem.ID_NOTIFICATION_TOKEN,
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
                      {
                        template: (deleteItem, options) => {
                          return inViewMenuItem?.IS_ACTIVE ? (
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                change_status(e, inViewMenuItem?.ID_NOTIFICATION_TOKEN);
                              }}
                              className="p-menuitem-link"
                            >
                              <span className="p-menuitem-text ">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-toggle-off" viewBox="0 0 16 16"
                                  style={{ marginRight: "0.5rem", transform: "scale(1.3)" }}>
                                  <path d="M11 4a4 4 0 0 1 0 8H8a4.992 4.992 0 0 0 2-4 4.992 4.992 0 0 0-2-4h3zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5z" />
                                </svg>
                                Desactive
                              </span>
                            </a>
                          ) : (
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                change_status(e, inViewMenuItem?.ID_NOTIFICATION_TOKEN);
                              }}
                              className="p-menuitem-link"
                            >
                              <span className="p-menuitem-text ">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-toggle-on" viewBox="0 0 16 16" style={{ marginRight: "0.5rem", transform: "scale(1.3)" }}>
                                  <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10H5zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
                                </svg>
                                Active
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
                          viewportHeight={170}
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
                            setOnenotification(item);
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
              {/* <Column
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
                            to={`#`}
                            className="p-menuitem-link"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              // setOnenotification(item);
                              setDetail(true);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-list"
                              viewBox="0 0 16 16"
                              style={{ marginRight: "0.5rem" }}
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                              />
                            </svg>
                            <span className="p-menuitem-text">Plus de detail</span>
                          </Link>
                        );
                      },
                    },

                    {
                      template: (deleteItem, options) => {

                        if (inViewMenuItem?.TOKEN != null && inViewMenuItem?.IS_ACTIVE != 0) {
                          return (
                            <Link
                              to={`#`}
                              className="p-menuitem-link"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setDisplaynotificationBasic(true);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-bell"
                                viewBox="0 0 16 16"
                                style={{ marginRight: "0.5rem" }}
                              >
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                              </svg>
                              <span className="p-menuitem-text">Envoyer notification</span>
                            </Link>
                          );
                        }

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
                          setOnenotification(item);
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
              /> */}




            </DataTable>
            {/* <Dialog
              headerStyle={{ backgroundImage: `url("/images/wasilibackground-04.jpg")`, backgroundSize: 'cover' }}
              headerClassName="text-white"
              header={`${intl.formatMessage({ id: "sessionsChauffeurs.ModalTitleSendNotif" })}  ${onenotification?.driver.NOM} ${onenotification?.driver.PRENOM} (${onenotification?.brand} ${onenotification?.modelName})`
              }
              visible={displayNotificationBasic}
              style={{ width: "50vw" }}
              onHide={() => setDisplaynotificationBasic(false)}
            >
              {!onenotification ? null : <Notification_session_driver notificationdriver={onenotification.ID_NOTIFICATION_TOKEN} setvisible={setDisplaynotificationBasic} />}
            </Dialog> */}

            <Dialog
              headerStyle={{ backgroundColor: '#ecc5c5', backgroundSize: 'cover' }}
              headerClassName="text-black"
              header={`Détail de ${onenotification?.utilisateursmembre.NOM} ${onenotification?.utilisateursmembre.PRENOM} (${onenotification?.brand} ${onenotification?.modelName})`}

              visible={detail}
              style={{ width: "70vw" }}
              onHide={() => setDetail(false)}
            >
              {!onenotification ? null : <Detailmembre detaildriver={onenotification} />}
            </Dialog>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}


