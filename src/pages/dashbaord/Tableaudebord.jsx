
import { Link, Outlet } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { setBreadCrumbItemsAction } from "../../store/actions/appActions";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";
import { Button } from "primereact/button";
import DashboardSkeletons from "../../components/skeletons/DashboardSkeletons";
import HomeSkeletons from "../../components/skeletons/HomeSkeletons";
import Dashboard from "../../components/rapport/Dashboard";
import PROFILS from "../../constants/PROFILS";
import  DashboardProvider  from "../../components/rapport/DashboardProvider";

export default function Tableaudebord() {
    const [dates, setDates] = useState(null);
    const phaseCalendarRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0); // Correction initialisation
    const dispatch = useDispatch();
    const user = useSelector(userSelector);
    
    // Mise à jour des breadcrumbs
    useEffect(() => {
        setLoading(true);
        dispatch(setBreadCrumbItemsAction([
            { path: "dashbord", name: "Tableau de bord" }
        ]));
        document.title = "Tableau de bord";

        return () => {
            dispatch(setBreadCrumbItemsAction([]));
        };
    }, []);



    return (
        <DashboardProvider>
        
            <div className="px-3 py-3 main_content">
                <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                    <h1 className="mb-0 webtitre">Tableau de bord</h1>
                    <div className="selection-actions d-flex align-items-center">
                        
                        {/* Bouton de rafraîchissement */}
                        <Button
                            disabled={loading}
                            className="mr-2 py-1"
                            onClick={() => setRefresh(prev => prev + 1)} // Incrémente `refresh`
                            type="button"
                            icon={() => (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16">
                                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                    <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                                </svg>
                            )}
                            outlined
                            data-pr-tooltip="Reffraichir"
                            severity="secondary"
                            tooltip
                            tooltipOptions={{ position: 'bottom' }}
                        />
                        {/* Sélecteur de dates */}
                        {!loading && (
                            <div>
                                 {/* <button
                                        className="btn btn-outline-secondary mr-2 btn-sm d-flex align-items-center"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            phaseCalendarRef.current.show();
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" className="bi bi-calendar2-check" viewBox="0 0 16 16">
                                            <path d="M10.854 8.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z" />
                                            <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z" />
                                        </svg>
                                        <span className="ml-1">
                                            {dates ? moment(dates).format("DD/MM/YYYY") : `Aujourd'hui`}
                                        </span>
                                    </button> */}

                                <Calendar
                                    value={dates}
                                    onChange={(e) => setDates(e.value)}
                                    readOnlyInput
                                    placeholder="periode"
                                    className="w-full md:w-20rem no-p mx-3 opacity-0 right-0 position-absolute pointer-events-none"
                                    style={{ top: 100 }}
                                    inputStyle={{ padding: "9px 0.75rem" }}
                                    showButtonBar
                                    todayButtonClassName="opacity-0"
                                    dateFormat="dd/mm/yy"
                                    inputClassName="cursor-pointer"
                                    showIcon
                                    iconPos="left"
                                    ref={phaseCalendarRef}
                                    maxDate={new Date()}
                                // minDate={new Date()}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {/* Affichage du Skeleton pendant le chargement */}
                <div className="content ola">
                    {loading ? (
                        ''
                        // <div className="d-flex">
                        //     <div className="div flex-fill">
                        //         <DashboardSkeletons />
                        //         <HomeSkeletons />
                        //     </div>
                        // </div>
                    ) : (
                        null
                        // <Dashboard dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
                    )}
                    <Dashboard dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
                </div>
            </div>
            <Outlet />
        </DashboardProvider>
    );
    
}



