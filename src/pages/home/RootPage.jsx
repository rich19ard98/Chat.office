import { Link, Outlet } from "react-router-dom";
import { Skeleton } from 'primereact/skeleton';
import DashboardSkeletons from "../../components/skeletons/DashboardSkeletons";
import HomeSkeletons from "../../components/skeletons/HomeSkeletons";
import AsideSkeletons from "../../components/skeletons/AsideSkeletons";

export default function RootPage() {
          return (
                    <>
                    <div className="px-4 py-3 main_content">
                              <h1 className="mb-3">Tableau de bord</h1>
                              <div className="content">
                                        <div className="d-flex">
                                                  <div className="div flex-fill">
                                                            <DashboardSkeletons />
                                                            <HomeSkeletons />
                                                  </div>
                                                  <AsideSkeletons />
                                        </div>
                                        {/* <Link to={'/products'}>
                                                  Products
                                        </Link> */}
                              </div>
                    </div>
                    <Outlet />
                    </>
          )
}