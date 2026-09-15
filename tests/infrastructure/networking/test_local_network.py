import pytest
from unittest.mock import patch
from src.infrastructure.networking.local_network import LocalNetworkNode

def test_network_node_is_reachable():
    node = LocalNetworkNode(ip_address="8.8.8.8", mac_address="00:00:00:00:00:00", hostname="google-dns")
    
    with patch("subprocess.run") as mock_run:
        # Mock a successful ping (returncode 0)
        mock_run.return_value.returncode = 0
        
        assert node.is_reachable() is True
        mock_run.assert_called_once()

def test_network_node_is_unreachable():
    node = LocalNetworkNode(ip_address="192.0.2.1", mac_address="00:00:00:00:00:00", hostname="test-net")
    
    with patch("subprocess.run") as mock_run:
        # Mock a failed ping (returncode non-zero)
        mock_run.return_value.returncode = 1
        
        assert node.is_reachable() is False
        mock_run.assert_called_once()
