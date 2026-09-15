import subprocess
import platform
from src.domain.entities import NetworkNode

class LocalNetworkNode(NetworkNode):
    """Concrete implementation of a NetworkNode for testing reachability."""
    
    def is_reachable(self) -> bool:
        """Pings the node to determine reachability."""
        param = "-n" if platform.system().lower() == "windows" else "-c"
        command = ["ping", param, "1", self.ip_address]
        
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except Exception:
            return False
