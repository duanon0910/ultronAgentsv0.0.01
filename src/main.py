import os
import sys
import argparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def main():
    parser = argparse.ArgumentParser(description="Ultron Agent")
    args = parser.parse_args()

    # Launching the HTML template as a desktop GUI app using pywebview
    template_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 
        '..', 
        'ULTRON — Hệ điều hành nhận thức', 
        'index.html'
    ))
    
    import webview
    webview.create_window('Ultron OS', template_path, width=1200, height=800)
    webview.start()

if __name__ == "__main__":
    main()
