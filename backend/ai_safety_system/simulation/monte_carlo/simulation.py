import random

def run_simulation(n=100):
    risks = [random.randint(30, 90) for _ in range(n)]
    avg = sum(risks) / len(risks)

    return {
        "average_risk": int(avg)
    }