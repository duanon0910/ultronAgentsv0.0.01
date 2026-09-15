from textual.app import App, ComposeResult
from textual.containers import Horizontal
from textual.widgets import Header, Footer, Static, Input, Log
from textual.reactive import reactive
import psutil

from src.infrastructure.agent.hermes_adapter import HermesAgentAdapter

class VitalsPane(Static):
    cpu = reactive("CPU: 0%")
    ram = reactive("RAM: 0%")

    def on_mount(self) -> None:
        self.set_interval(1.0, self.update_vitals)

    def update_vitals(self) -> None:
        self.cpu = f"CPU: {psutil.cpu_percent()}%"
        self.ram = f"RAM: {psutil.virtual_memory().percent}%"
        self.update(f"[bold green]SYSTEM VITALS[/]\n\n{self.cpu}\n{self.ram}\n\n[bold green]NETWORK[/]\nStatus: Online")

class UltronDashboard(App):
    CSS_PATH = "dashboard.tcss"

    def __init__(self):
        super().__init__()
        self.agent = HermesAgentAdapter()

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal():
            self.log_pane = Log(id="left-pane")
            yield self.log_pane
            yield VitalsPane(id="right-pane")
        yield Input(placeholder="ultron@sys:~$ ", id="cmd-input")
        yield Footer()

    def on_mount(self) -> None:
        self.log_pane.write_line("[bold green]Ultron v1.0 Agent Initialized (Hermes Core)...[/]")

    async def on_input_submitted(self, event: Input.Submitted) -> None:
        command = event.value
        self.log_pane.write_line(f"ultron@sys:~$ {command}")
        event.input.value = ""
        
        # Route to agent asynchronously
        response = await self.agent.process_input(command)
        self.log_pane.write_line(response)

