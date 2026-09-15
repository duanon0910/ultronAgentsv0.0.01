import pytest
from unittest.mock import patch, MagicMock
from src.infrastructure.os_system.local_machine import LocalMachine

def test_local_machine_get_status():
    machine = LocalMachine(device_id="host_01", os_type="windows", is_online=True)
    
    with patch("psutil.cpu_percent", return_value=45.0), \
         patch("psutil.virtual_memory") as mock_vmem:
        
        mock_vmem_instance = MagicMock()
        mock_vmem_instance.percent = 60.5
        mock_vmem.return_value = mock_vmem_instance
        
        status = machine.get_status()
        
        assert status["cpu_percent"] == 45.0
        assert status["ram_percent"] == 60.5
        assert status["os"] == "windows"

def test_local_machine_execute_command():
    machine = LocalMachine(device_id="host_01", os_type="windows")
    
    with patch("subprocess.run") as mock_run:
        mock_process = MagicMock()
        mock_process.stdout = "hello world\n"
        mock_run.return_value = mock_process
        
        result = machine.execute_command("echo hello world")
        
        assert result.strip() == "hello world"
        mock_run.assert_called_once()
