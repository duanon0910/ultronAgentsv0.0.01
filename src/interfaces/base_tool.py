from abc import ABC, abstractmethod
from typing import Any, Dict

class AgentTool(ABC):
    """Abstract Base Class for all tools the Agent can use."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """The identifier of the tool."""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Description of what the tool does (used by the LLM reasoning loop)."""
        pass

    @abstractmethod
    def run(self, **kwargs: Any) -> Dict[str, Any]:
        """Executes the tool's core logic with the provided arguments."""
        pass
