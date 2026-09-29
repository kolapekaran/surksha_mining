
import { useState } from "react";

import { useAppContext } from "../context/appcontext";

function ReportScreen() {
  const [reportGenerated, setReportGenerated] = useState(false);

  const {
    detections,
    alerts,
    cameraStatus,
    systemStatus,
  } = useAppContext();

  const inspectionDate = new Date().toLocaleDateString();
  const inspectionTime = new Date().toLocaleTimeString();

  const highRiskEvents = detections.filter(
    (detection) =>
      detection.risk === "HIGH" ||
      detection.risk === "CRITICAL"
  );

  const mediumRiskEvents = detections.filter(
    (detection) => detection.risk === "MEDIUM"
  );

  const lowRiskEvents = detections.filter(
    (detection) => detection.risk === "LOW"
  );

  const getOverallRisk = () => {
    if (detections.length === 0) {
      return "NO DATA";
    }

    if (
      detections.some(
        (detection) => detection.risk === "CRITICAL"
      )
    ) {
      return "CRITICAL";
    }

    if (
      detections.some(
        (detection) => detection.risk === "HIGH"
      )
    ) {
      return "HIGH";
    }

    if (
      detections.some(
        (detection) => detection.risk === "MEDIUM"
      )
    ) {
      return "MEDIUM";
    }

    return "LOW";
  };

  const getRecommendation = (risk, label) => {
    if (risk === "CRITICAL") {
      return `Stop the affected operation and immediately investigate ${label}.`;
    }

    if (risk === "HIGH") {
      return `Ensure corrective safety action is taken for ${label}.`;
    }

    if (risk === "MEDIUM") {
      return `Review the detected ${label} condition and take preventive action.`;
    }

    return `Continue monitoring the ${label} detection.`;
  };

  const reportData = {
    reportId: `SAFETY-REPORT-${Date.now()}`,
    inspectionDate,
    inspectionTime,
    location: "Industrial Safety Monitoring Zone",
    totalDetections: detections.length,
    highRiskEvents: highRiskEvents.length,
    mediumRiskEvents: mediumRiskEvents.length,
    lowRiskEvents: lowRiskEvents.length,
    overallRisk: getOverallRisk(),
    violations: detections.map((detection) => ({
      id: detection.id,
      type: detection.label,
      confidence: detection.confidence,
      risk: detection.risk,
      recommendation: getRecommendation(
        detection.risk,
        detection.label
      ),
    })),
  };

  const generateReport = () => {
    setReportGenerated(true);
  };

  const printReport = () => {
    window.print();
  };

  const getRiskColor = (risk) => {
    if (risk === "CRITICAL" || risk === "HIGH") {
      return "#ef4444";
    }

    if (risk === "MEDIUM") {
      return "#f59e0b";
    }

    if (risk === "LOW") {
      return "#22c55e";
    }

    return "#94a3b8";
  };

  return (
    <div className="suraksha-screen sx-reports"><div className="sx-page">
      <header className="sx-screen-head"><div><span className="sx-panel-code">REPORTING / 401</span><h1>Safety evidence</h1><p>Inspection snapshot generated from the current monitoring context.</p></div><div className="sx-report-actions"><button onClick={generateReport} className="sx-primary-action">GENERATE REPORT <span>↗</span></button><button onClick={printReport}>PRINT</button></div></header>
      <section className="sx-report-banner"><div><span className="sx-panel-code">REPORT ID</span><h2>{reportData.reportId}</h2><p>{reportData.inspectionDate} · {reportData.inspectionTime} · {reportData.location}</p></div><div className={"sx-report-risk "+reportData.overallRisk.toLowerCase()}><small>OVERALL RISK</small><strong>{reportData.overallRisk}</strong></div></section>
      <section className="sx-report-stats"><div><span>TOTAL</span><strong>{reportData.totalDetections}</strong><small>detections</small></div><div className="danger"><span>HIGH / CRITICAL</span><strong>{reportData.highRiskEvents}</strong><small>priority events</small></div><div className="warn"><span>MEDIUM</span><strong>{reportData.mediumRiskEvents}</strong><small>review events</small></div><div className="safe"><span>LOW</span><strong>{reportData.lowRiskEvents}</strong><small>low-risk events</small></div><div><span>ALERT QUEUE</span><strong>{alerts.length}</strong><small>active records</small></div></section>
      <section className="sx-report-grid"><article className="sx-panel"><div className="sx-panel-head"><div><span className="sx-panel-code">FINDINGS / 402</span><h2>Detection evidence</h2></div><span className="sx-count-badge">{reportData.violations.length}</span></div>{reportData.violations.length?<div className="sx-finding-list">{reportData.violations.map(v=><div className="sx-finding" key={v.id}><div className="sx-finding-marker"/><div className="sx-finding-main"><div><b>{v.type}</b><span className={"sx-risk-tag "+String(v.risk).toLowerCase()}>{v.risk}</span></div><small>CONFIDENCE {v.confidence==null?"N/A":v.confidence+"%"}</small><p>{v.recommendation}</p></div></div>)}</div>:<div className="sx-empty-state"><span>◎</span><b>NO FINDINGS</b><small>Capture and analyze a camera frame to populate inspection evidence.</small></div>}</article>
        <aside className="sx-panel sx-report-meta"><span className="sx-panel-code">SYSTEM / 403</span><h2>Inspection context</h2><div><span>CAMERA STATE</span><b>{cameraStatus}</b></div><div><span>SYSTEM STATE</span><b>{systemStatus}</b></div><div><span>LOCATION</span><b>{reportData.location}</b></div><div><span>GENERATED</span><b>{reportGenerated?"CONFIRMED":"PENDING"}</b></div>{reportGenerated&&<div className="sx-success-note">✓ Report snapshot generated from current context.</div>}</aside>
      </section>
      <section className="sx-report-disclaimer"><span>DATA INTEGRITY</span><p>Report content reflects the current frontend detection context. Backend persistence and export functionality remain separate from this presentation layer.</p></section>
    </div></div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "10px",
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        {title}
      </p>

      <p
        style={{
          margin: 0,
          color: "#f8fafc",
          fontWeight: "bold",
          fontSize: "15px",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          color: "#cbd5e1",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: 0,
          color,
          fontSize: "30px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function buttonStyle(backgroundColor) {
  return {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor,
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  };
}

export default ReportScreen;