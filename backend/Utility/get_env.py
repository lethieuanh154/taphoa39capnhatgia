import os
from dotenv import load_dotenv


dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path,override=True)
else:
    print(f".env file not found at: {dotenv_path}")
    exit(1)

UserName = os.getenv('UserName')
LatestBranchId=os.getenv('LatestBranchId')
Password=os.getenv('Password')
retailer=os.getenv('retailer')
