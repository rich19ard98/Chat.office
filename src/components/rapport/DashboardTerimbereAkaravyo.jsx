
import React, { useCallback, useEffect, useState, useRef } from "react";
import fetchApi from "../../helpers/fetchApi";
import { Dialog } from 'primereact/dialog';
import { useDispatch } from "react-redux";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { ProgressBar } from "primereact/progressbar";
import RepartitionTypeCreditsTerimbereAkaravyo from "./RepartitionTypeCreditsTerimbereAkaravyo";



export default function DashboardTerimbereAkaravyo({ dates, loading, setLoading, refresh }) {

    return (
        <div className="col-12 xl:col-4 " >
            {/* <div className="card h-auzto"> */}
            <div className="card h-full">

                <RepartitionTypeCreditsTerimbereAkaravyo dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
            </div>
        </div>
    )
}





