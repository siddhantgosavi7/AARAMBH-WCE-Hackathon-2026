"""
Autonomous Sensor Simulator Streamer.

Can be run:
  1. Internally via FastAPI APScheduler / background thread
  2. As a standalone CLI worker: python simulator/sensor_sim.py --scenario normal --interval 5
"""

import time
import argparse
import logging
from datetime import datetime
import requests
from simulator.scenarios import generate_scenario_reading, SCENARIO_CONFIGS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SensorSimulator")


class SensorSimulator:
    def __init__(self, api_base_url: str = "http://localhost:8000/api"):
        self.api_base_url = api_base_url.rstrip("/")
        self.running = False
        self.current_scenario = "normal"
        self.tick_count = 0
        self.last_tick_time = None

    def tick_once(self, pond_ids=None):
        now = datetime.utcnow()
        hour_of_day = now.hour + now.minute / 60.0 + now.second / 3600.0

        if not pond_ids:
            try:
                res = requests.get(f"{self.api_base_url}/ponds", timeout=3.0)
                if res.status_code == 200:
                    pond_ids = [p["id"] for p in res.json()]
                else:
                    pond_ids = [1]
            except Exception as e:
                logger.warning(f"Could not fetch pond list: {e}. Defaulting to pond_id=1")
                pond_ids = [1]

        results = []
        for p_id in pond_ids:
            temp, do, ph, nh3 = generate_scenario_reading(self.current_scenario, hour_of_day)
            payload = {
                "pond_id": p_id,
                "temperature": temp,
                "dissolved_oxygen": do,
                "ph": ph,
                "ammonia": nh3,
                "timestamp": now.isoformat(),
            }
            try:
                r = requests.post(f"{self.api_base_url}/readings", json=payload, timeout=3.0)
                if r.status_code == 201:
                    results.append((p_id, temp, do))
            except Exception as e:
                logger.error(f"Failed to post reading for pond {p_id}: {e}")

        self.tick_count += 1
        self.last_tick_time = now.isoformat()
        logger.info(f"Tick #{self.tick_count} [{self.current_scenario}] -> Generated readings for {len(results)} ponds.")
        return results

    def run_loop(self, scenario: str = "normal", interval: float = 5.0, count: int = 0):
        self.running = True
        self.current_scenario = scenario
        logger.info(f"Starting sensor simulation loop [Scenario: {scenario}, Interval: {interval}s]...")

        iterations = 0
        try:
            while self.running:
                self.tick_once()
                iterations += 1
                if count > 0 and iterations >= count:
                    break
                time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("Simulation halted by user.")
        finally:
            self.running = False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AquaFeed Sensor Simulator")
    parser.add_argument("--scenario", choices=list(SCENARIO_CONFIGS.keys()), default="normal")
    parser.add_argument("--interval", type=float, default=5.0)
    parser.add_argument("--count", type=int, default=0, help="Number of ticks (0 for infinite)")
    parser.add_argument("--api", type=str, default="http://localhost:8000/api")
    args = parser.parse_args()

    sim = SensorSimulator(api_base_url=args.api)
    sim.run_loop(scenario=args.scenario, interval=args.interval, count=args.count)
