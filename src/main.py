import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.interfaces.cli.dashboard import UltronDashboard

def main():
    app = UltronDashboard()
    app.run()

if __name__ == "__main__":
    main()
