
// import DashboardTerimbereAkaravyo from "./DashboardTerimbereAkaravyo";
// import StatistiquesCredits from "./StatistiquesCredits";

// // import PaiementsVentes from "./CreditRembourseImpaye";

// export default function Dashboardpartieun({ dates, loading, setLoading, refresh }) {
//   return (
//     <>
//       <div className="col-12 md:col-6 xl:col-8 tablette"  >
//         <div className="card h-auto p-4">
//           <StatistiquesCredits dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />

//         </div>
//       </div>

//       <DashboardTerimbereAkaravyo dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
//     </>

//   )
// }



import { useState } from "react";
import StatistiquesCredits from "./StatistiquesCredits";
import DashboardTerimbereAkaravyo from "./DashboardTerimbereAkaravyo";

export default function Dashboardpartieun({ dates, refresh }) {
  const [loading, setLoading] = useState(false); // ✅ on crée loading & setLoading

  return (
    <>
      <div className="col-12 md:col-6 xl:col-8 tablette">
        <div className="card h-auto p-4">
          <StatistiquesCredits
            dates={dates}
            setLoading={setLoading}   // ✅ passe bien la fonction
            refresh={refresh}
          />
        </div>
      </div>

      <DashboardTerimbereAkaravyo
        dates={dates}
        setLoading={setLoading}
        refresh={refresh}
      />
    </>
  );
}










