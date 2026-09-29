from ai_safety_system.simulation.modules.fire_module import run as fire
from ai_safety_system.simulation.modules.ppe_module import run as ppe
from ai_safety_system.simulation.modules.fatigue_module import run as fatigue
from ai_safety_system.simulation.modules.risk_module import run as risk
from ai_safety_system.simulation.modules.electrical_module import run as electrical
from ai_safety_system.simulation.modules.machinery_module import run as machinery


def run_simulation(data):
    results = []

    results.append(fire(data))
    results.append(ppe(data))
    results.append(fatigue(data))
    results.append(electrical(data))
    results.append(machinery(data))

    final_risk = risk(results)

    return {
        "modules": results,
        "final_risk": final_risk
    }