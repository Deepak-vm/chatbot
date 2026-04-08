import os
import requests
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.tools import tool


# ── Search tool ────────────────────────────────────────────────────────────────
search_tool = DuckDuckGoSearchRun(region='us-en')


# ── Calculator ────────────────────────────────────────────────────────────────
@tool
def calculator(first_ip: float, second_ip: float, operator: str) -> dict:
    """Perform a basic arithmetic calculation.
    Supported operators: add, sub, mul, div.
    Returns a dictionary with the result or an error message.
    """
    try:
        if operator == 'add':
            result = first_ip + second_ip
        elif operator == 'sub':
            result = first_ip - second_ip
        elif operator == 'mul':
            result = first_ip * second_ip
        elif operator == 'div':
            if second_ip == 0:
                return {'error': 'Division by zero is not allowed'}
            result = first_ip / second_ip
        else:
            return {'error': f'Invalid operator: "{operator}". Use add, sub, mul, or div.'}
    except Exception as e:
        return {'error': str(e)}

    return {'result': result}  # FIX: was missing — function returned None on success


# ── Stock price ───────────────────────────────────────────────────────────────
@tool
def get_stock_price(symbol: str) -> dict:
    """Fetch the latest daily stock price for a given ticker symbol.
    Use this when the user asks about a stock price, market value, or share price.
    Examples: 'AAPL' for Apple, 'TSLA' for Tesla, 'GOOGL' for Google.
    Returns a dictionary containing daily time-series price data.
    """
    api_key = os.getenv("ALPHAVANTAGE_API_KEY")  # FIX: read from env, never hardcode
    if not api_key:
        return {'error': 'ALPHAVANTAGE_API_KEY is not set in the environment.'}

    url = (
        f"https://www.alphavantage.co/query"
        f"?function=TIME_SERIES_DAILY"
        f"&symbol={symbol}"
        f"&outputsize=compact"
        f"&apikey={api_key}"
    )
    try:
        r = requests.get(url, timeout=10)  # FIX: added timeout to avoid hanging
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        return {'error': str(e)}


# ── Exported tool list ────────────────────────────────────────────────────────
TOOLS = [get_stock_price, calculator, search_tool]
