from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class Device(ABC):
    """Abstract Base Class for all managed devices (Host, Mobile)."""
    device_id: str
    os_type: str
    is_online: bool = False

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Returns the current status vitals of the device."""
        pass

    @abstractmethod
    def execute_command(self, command: str) -> str:
        """Executes an OS-level or simulated command on the device."""
        pass

@dataclass
class NetworkNode(ABC):
    """Abstract Base Class for network entities (Routers, Switches, Targets)."""
    ip_address: str
    mac_address: str
    hostname: str

    @abstractmethod
    def is_reachable(self) -> bool:
        """Tests network connectivity to the node."""
        pass
