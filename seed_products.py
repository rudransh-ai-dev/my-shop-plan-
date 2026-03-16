import psycopg2
from datetime import datetime

COMPANY_ID = 18  # Main Shop

products = [
    # --- First 50 ---
    ("MAGG001",  "Maggi 2-Minute Masala Noodles", 12.00, 15.00, 200, 5.0,  "1902.30.90"),
    ("RICEB002", "Basmati Rice",                  65.00, 85.00,  80, 0.0,  "1006.30.20"),
    ("ATTAW003", "Wheat Flour (Atta)",             28.00, 35.00, 100, 0.0,  "1101.00.00"),
    ("SUGAR004", "Sugar",                          38.00, 45.00, 150, 5.0,  "1701.14.10"),
    ("SALTT005", "Iodized Salt",                   15.00, 20.00, 300, 0.0,  "2501.00.10"),
    ("TOORD006", "Toor Dal",                      110.00,140.00,  60, 0.0,  "0713.60.00"),
    ("MOONG007", "Moong Dal",                      90.00,120.00,  70, 0.0,  "0713.31.00"),
    ("CHANAD008","Chana Dal",                      70.00, 90.00,  80, 0.0,  "0713.20.00"),
    ("URADD009", "Urad Dal",                       95.00,125.00,  50, 0.0,  "0713.31.00"),
    ("MASAL010", "Turmeric Powder",               180.00,220.00,  40, 5.0,  "0910.30.20"),
    ("CHILIP011","Red Chilli Powder",             160.00,200.00,  45, 5.0,  "0904.22.12"),
    ("CORIP012", "Coriander Powder",              140.00,180.00,  55, 5.0,  "0909.22.00"),
    ("CUMIN013", "Cumin Seeds (Jeera)",           220.00,280.00,  30, 5.0,  "0909.31.00"),
    ("GARAM014", "Garam Masala",                  250.00,320.00,  35, 5.0,  "0910.99.19"),
    ("TEALE015", "Tea Leaves (CTC)",              180.00,240.00,  60, 5.0,  "0902.40.20"),
    ("COFFI016", "Instant Coffee",                220.00,280.00,  40, 18.0, "2101.11.10"),
    ("OILMU017", "Mustard Oil",                   140.00,180.00,  70, 5.0,  "1514.91.10"),
    ("OILSO018", "Sunflower Oil",                 110.00,145.00,  90, 5.0,  "1512.19.10"),
    ("GHEE019",  "Pure Ghee",                     480.00,580.00,  25, 12.0, "0405.10.00"),
    ("MILKP020", "Milk Powder",                   320.00,380.00,  40, 5.0,  "0402.10.10"),
    ("BESAN021", "Besan (Gram Flour)",             55.00, 70.00,  80, 0.0,  "1106.10.00"),
    ("POHA022",  "Poha (Flattened Rice)",          45.00, 60.00, 100, 0.0,  "1104.29.00"),
    ("SUJI023",  "Sooji/Rava",                     45.00, 60.00,  90, 0.0,  "1103.19.00"),
    ("MAIDA024", "Maida",                          38.00, 50.00,  80, 0.0,  "1101.00.00"),
    ("BISCU025", "Parle-G Biscuits",               8.00, 10.00, 500, 18.0, "1905.31.00"),
    ("CHIPS026", "Lay's Classic Chips",            18.00, 20.00, 200, 12.0, "2008.19.10"),
    ("NAMKE027", "Haldiram's Bhujia",              90.00,120.00,  60, 12.0, "2106.90.99"),
    ("SOAPB028", "Lifebuoy Soap",                  12.00, 15.00, 150, 18.0, "3401.11.10"),
    ("TOOTH029", "Colgate Toothpaste",             45.00, 55.00, 100, 18.0, "3306.10.10"),
    ("SHAMP030", "Clinic Plus Shampoo",            80.00,100.00,  50, 18.0, "3305.10.90"),
    ("DETER031", "Surf Excel Detergent",          180.00,220.00,  40, 18.0, "3402.20.10"),
    ("SOAPP032", "Rin Detergent Powder",           90.00,110.00,  70, 18.0, "3402.20.10"),
    ("MATCH033", "Matchbox (Pack of 10)",          20.00, 30.00, 200, 18.0, "3605.00.10"),
    ("CANDL034", "Candles (Pack of 10)",           35.00, 50.00,  80, 12.0, "3406.00.10"),
    ("BATTE035", "Eveready AA Batteries",          25.00, 35.00, 100, 18.0, "8506.10.00"),
    ("RAZOR036", "Gillette Razor Blades",         180.00,220.00,  40, 18.0, "8212.10.00"),
    ("PASTE037", "Closeup Toothpaste",             50.00, 65.00,  80, 18.0, "3306.10.10"),
    ("HONEY038", "Dabur Honey",                   180.00,220.00,  30, 5.0,  "0409.00.00"),
    ("JAM039",   "Mixed Fruit Jam",                90.00,120.00,  50, 12.0, "2007.91.00"),
    ("SAUCE040", "Maggi Tomato Ketchup",           90.00,110.00,  60, 12.0, "2103.20.00"),
    ("PICKL041", "Mango Pickle",                  120.00,150.00,  40, 12.0, "2001.90.10"),
    ("PAPAD042", "Lijjat Papad",                   70.00, 90.00,  80, 5.0,  "1905.90.40"),
    ("VERMI043", "Vermicelli (Sewai)",             45.00, 60.00,  90, 5.0,  "1902.19.00"),
    ("CORNF044", "Corn Flakes",                   140.00,180.00,  40, 12.0, "1904.10.90"),
    ("NOODL045", "Yippee Noodles",                 12.00, 15.00, 180, 5.0,  "1902.30.90"),
    ("PEANU046", "Roasted Peanuts",                80.00,100.00,  70, 5.0,  "2008.11.00"),
    ("CASHE047", "Cashew Nuts",                   550.00,680.00,  20, 5.0,  "0801.32.00"),
    ("ALMON048", "Almonds",                       600.00,750.00,  25, 5.0,  "0802.12.00"),
    ("RAISN049", "Raisins (Kishmish)",            180.00,240.00,  40, 5.0,  "0806.20.10"),
    ("CRAX050",  "Crax (Namkeen)",                  3.50,  5.00, 150, 12.0, "2106.90.99"),
    # --- 51–100 Pulses, Grains, Spices ---
    ("RAJMA051", "Rajma (Kidney Beans)",           95.00,125.00,  60, 0.0,  "0713.33.00"),
    ("BLKCH052", "Black Chana",                    65.00, 85.00,  90, 0.0,  "0713.20.90"),
    ("KABCH053", "Kabuli Chana",                   75.00,100.00,  70, 0.0,  "0713.20.10"),
    ("MASO054",  "Masoor Dal",                     80.00,105.00,  80, 0.0,  "0713.40.00"),
    ("GRMOO055", "Green Moong Dal Whole",          85.00,110.00,  65, 0.0,  "0713.31.90"),
    ("BLKUR056", "Black Urad Dal",                100.00,130.00,  50, 0.0,  "0713.31.00"),
    ("SPLCH057", "Split Bengal Gram (Chana Dal)",  68.00, 88.00,  85, 0.0,  "0713.20.00"),
    ("YELMO058", "Yellow Moong Dal",               88.00,115.00,  75, 0.0,  "0713.31.00"),
    ("GRPEA059", "Green Peas (Matar)",             90.00,120.00,  55, 0.0,  "0713.10.00"),
    ("SOYBE060", "Soyabean",                       55.00, 75.00, 100, 0.0,  "1201.90.10"),
    ("WHOLE061", "Whole Wheat (Gehu)",             28.00, 36.00, 120, 0.0,  "1001.99.10"),
    ("JOWAR062", "Jowar (Sorghum)",                45.00, 60.00,  80, 0.0,  "1007.90.00"),
    ("BAJRA063", "Bajra (Pearl Millet)",           42.00, 55.00,  90, 0.0,  "1008.30.00"),
    ("RAGI064",  "Ragi (Finger Millet)",           48.00, 65.00,  70, 0.0,  "1008.90.90"),
    ("CORNG065", "Corn (Makki)",                   50.00, 68.00,  85, 0.0,  "1005.90.00"),
    ("SONAM066", "Sona Masuri Rice",               52.00, 70.00, 100, 0.0,  "1006.30.90"),
    ("BRWNR067", "Brown Rice",                     70.00, 95.00,  50, 0.0,  "1006.30.90"),
    ("IDLER068", "Idli Rice",                      55.00, 72.00,  80, 0.0,  "1006.30.90"),
    ("PONNI069", "Ponni Rice",                     58.00, 78.00,  90, 0.0,  "1006.30.90"),
    ("JEERA070", "Jeera Rice",                     75.00,100.00,  60, 0.0,  "1006.30.20"),
    ("BLKPE071", "Black Pepper Whole",            480.00,620.00,  20, 5.0,  "0904.11.10"),
    ("CLOVE072", "Cloves",                        550.00,700.00,  15, 5.0,  "0907.10.00"),
    ("CARDG073", "Green Cardamom",               1200.00,1500.00, 10, 5.0,  "0908.31.00"),
    ("CARDB074", "Black Cardamom",               850.00,1100.00,  12, 5.0,  "0908.32.00"),
    ("CINNA075", "Cinnamon Sticks",               280.00,360.00,  25, 5.0,  "0906.20.00"),
    ("BAYLE076", "Bay Leaves",                    180.00,240.00,  40, 5.0,  "0910.99.14"),
    ("STARA077", "Star Anise",                    320.00,420.00,  30, 5.0,  "0909.21.00"),
    ("MACE078",  "Mace (Javitri)",               900.00,1150.00,  15, 5.0,  "0908.20.00"),
    ("NUTME079", "Nutmeg (Jaiphal)",             850.00,1100.00,  18, 5.0,  "0908.11.00"),
    ("HING080",  "Asafoetida (Hing)",            450.00,580.00,  25, 5.0,  "0910.99.22"),
    ("KASUR081", "Kasuri Methi",                  220.00,300.00,  35, 5.0,  "1211.90.90"),
    ("MUSTS082", "Mustard Seeds",                  90.00,120.00,  60, 5.0,  "1207.50.10"),
    ("METHI083", "Fenugreek Seeds (Methi Dana)",   85.00,110.00,  70, 5.0,  "0910.99.13"),
    ("SAUNF084", "Fennel Seeds (Saunf)",          140.00,180.00,  50, 5.0,  "0909.62.00"),
    ("AJWAI085", "Ajwain (Carom Seeds)",          180.00,240.00,  40, 5.0,  "0909.61.00"),
    ("TIL086",   "Sesame Seeds (Til)",            120.00,160.00,  55, 5.0,  "1207.40.10"),
    ("KHUSK087", "Poppy Seeds (Khus Khus)",       380.00,500.00,  20, 5.0,  "1207.91.00"),
    ("SABUD088", "Sabudana (Tapioca Pearls)",      65.00, 90.00,  80, 5.0,  "1108.14.00"),
    ("ARROW089", "Arrowroot Powder",              110.00,150.00,  40, 5.0,  "1106.20.90"),
    ("CORNS090", "Corn Starch",                    55.00, 75.00,  70, 12.0, "1108.12.00"),
    ("BAKPO091", "Baking Powder",                  90.00,120.00,  50, 18.0, "2102.30.00"),
    ("BAKSO092", "Baking Soda",                    40.00, 60.00, 100, 18.0, "2836.30.00"),
    ("VANIL093", "Vanilla Essence",               120.00,160.00,  40, 18.0, "3302.10.90"),
    ("FOODC094", "Food Color (Pack)",              80.00,110.00,  60, 18.0, "3204.19.90"),
    ("COCOA095", "Cocoa Powder",                  220.00,280.00,  35, 18.0, "1805.00.00"),
    ("CHOCS096", "Chocolate Syrup",               140.00,180.00,  45, 18.0, "2106.90.99"),
    ("CONDM097", "Condensed Milk",                180.00,220.00,  40, 12.0, "0402.99.10"),
    ("EVAPM098", "Evaporated Milk",               160.00,200.00,  35, 12.0, "0402.91.00"),
    ("BUTTE099", "Butter",                        420.00,500.00,  30, 12.0, "0405.10.00"),
    ("PANEER100","Paneer",                        280.00,350.00,  25, 5.0,  "0406.10.00"),
    # --- 101–150 Dairy, Dry Fruits, Sauces, Pasta ---
    ("CURD101",  "Curd (Dahi)",                    45.00, 60.00,  80, 5.0,  "0403.10.00"),
    ("LASSI102", "Lassi Mix",                      90.00,120.00,  50, 12.0, "0403.90.90"),
    ("CHAAS103", "Buttermilk (Chaas)",             35.00, 50.00,  90, 5.0,  "0403.90.10"),
    ("CHEES104", "Cheese Slices",                 220.00,280.00,  40, 12.0, "0406.90.00"),
    ("AMULC105", "Amul Fresh Cream",              180.00,220.00,  35, 12.0, "0401.50.00"),
    ("COCOM106", "Coconut Milk",                   90.00,120.00,  50, 12.0, "2008.19.90"),
    ("COCOP107", "Coconut Powder",                140.00,180.00,  45, 12.0, "2106.90.99"),
    ("DRYCO108", "Dry Coconut (Copra)",           120.00,160.00,  60, 5.0,  "0801.19.10"),
    ("DATES109", "Dates (Khajur)",                180.00,240.00,  50, 5.0,  "0804.10.00"),
    ("FIGS110",  "Figs (Anjeer)",                 450.00,580.00,  25, 5.0,  "0804.20.00"),
    ("APRIC111", "Apricots (Khurmani)",           380.00,500.00,  30, 5.0,  "0802.90.00"),
    ("WALNU112", "Walnuts",                       650.00,800.00,  20, 5.0,  "0802.32.00"),
    ("PISTA113", "Pistachios",                    950.00,1200.00, 15, 5.0,  "0802.52.00"),
    ("MAKHA114", "Fox Nuts (Makhana)",            550.00,700.00,  25, 5.0,  "1212.99.90"),
    ("CHIA115",  "Chia Seeds",                    280.00,380.00,  40, 5.0,  "1209.99.90"),
    ("FLAXS116", "Flax Seeds (Alsi)",             120.00,160.00,  60, 5.0,  "1207.99.90"),
    ("PUMPK117", "Pumpkin Seeds",                 320.00,420.00,  35, 5.0,  "1212.99.90"),
    ("SUNFL118", "Sunflower Seeds",               180.00,240.00,  50, 5.0,  "1206.00.90"),
    ("QUINO119", "Quinoa",                        380.00,500.00,  30, 5.0,  "1008.50.00"),
    ("OATSR120", "Rolled Oats",                   140.00,180.00,  60, 5.0,  "1104.12.00"),
    ("INSOA121", "Instant Oats",                  160.00,210.00,  50, 5.0,  "1904.10.90"),
    ("MUESL122", "Muesli",                        220.00,280.00,  40, 5.0,  "1904.20.00"),
    ("CORNF123", "Kellogg's Corn Flakes",         180.00,230.00,  45, 12.0, "1904.10.90"),
    ("WHEAT124", "Wheat Flakes",                  150.00,200.00,  55, 5.0,  "1904.10.90"),
    ("MURMU125", "Puffed Rice (Murmura)",          45.00, 60.00, 120, 0.0,  "1904.10.20"),
    ("ROAST126", "Roasted Gram (Chana)",           70.00, 95.00,  80, 5.0,  "2106.90.99"),
    ("SATTU127", "Sattu",                          60.00, 80.00,  70, 0.0,  "1106.10.00"),
    ("JAGGE128", "Jaggery (Gud)",                  55.00, 75.00, 100, 0.0,  "1701.14.90"),
    ("MISHR129", "Mishri (Rock Sugar)",            80.00,110.00,  60, 5.0,  "1701.14.90"),
    ("BRWNS130", "Brown Sugar",                    70.00, 95.00,  70, 5.0,  "1701.14.90"),
    ("PALMS131", "Palm Sugar",                    120.00,160.00,  50, 5.0,  "1702.90.90"),
    ("WHITV132", "White Vinegar",                  60.00, 80.00,  80, 12.0, "2209.00.10"),
    ("APPLE133", "Apple Cider Vinegar",           140.00,180.00,  45, 12.0, "2209.00.90"),
    ("SOYAS134", "Soya Sauce",                     90.00,120.00,  60, 12.0, "2103.90.90"),
    ("GRCHI135", "Green Chilli Sauce",             85.00,110.00,  65, 12.0, "2103.90.90"),
    ("REDCH136", "Red Chilli Sauce",               85.00,110.00,  70, 12.0, "2103.90.90"),
    ("SCHEW137", "Schezwan Sauce",               110.00,140.00,  50, 12.0, "2103.90.90"),
    ("MAYON138", "Mayonnaise",                    120.00,160.00,  55, 12.0, "2103.90.90"),
    ("MUSTA139", "Mustard Sauce",                 100.00,130.00,  50, 12.0, "2103.90.90"),
    ("BARBE140", "Barbecue Sauce",                130.00,170.00,  40, 12.0, "2103.90.90"),
    ("PASTA141", "Pasta Sauce",                   140.00,180.00,  45, 12.0, "2103.90.90"),
    ("MACAR142", "Macaroni",                       60.00, 80.00,  90, 5.0,  "1902.19.00"),
    ("SPAGH143", "Spaghetti",                      65.00, 85.00,  80, 5.0,  "1902.19.00"),
    ("FUSIL144", "Fusilli Pasta",                  70.00, 95.00,  70, 5.0,  "1902.19.00"),
    ("PENNE145", "Penne Pasta",                    70.00, 95.00,  75, 5.0,  "1902.19.00"),
    ("LASAG146", "Lasagna Sheets",                120.00,160.00,  40, 5.0,  "1902.19.00"),
    ("TOPRA147", "Top Ramen Instant Noodles",      12.00, 15.00, 200, 5.0,  "1902.30.90"),
    ("HAKKA148", "Hakka Noodles",                  45.00, 60.00,  80, 5.0,  "1902.30.90"),
    ("RICEN149", "Rice Noodles",                   80.00,110.00,  50, 5.0,  "1902.19.00"),
    ("WHEAT150", "Wheat Noodles",                  50.00, 70.00,  90, 5.0,  "1902.30.90"),
]

def seed():
    conn = psycopg2.connect('postgresql://postgres:password@localhost:5432/businesshub')
    cur = conn.cursor()
    now = datetime.utcnow()
    inserted = 0
    skipped = 0

    for sku, name, purchase, selling, stock, gst, hsn in products:
        cur.execute("SELECT id FROM products WHERE sku = %s AND company_id = %s", (sku, COMPANY_ID))
        if cur.fetchone():
            print(f"  SKIP  {sku} - {name}")
            skipped += 1
            continue
        cur.execute("""
            INSERT INTO products
                (company_id, sku, name, purchase_price, selling_price, stock, gst_rate, hsn_code, is_active, created_at, updated_at)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, true, %s, %s)
        """, (COMPANY_ID, sku, name, purchase, selling, stock, gst, hsn, now, now))
        print(f"  ADD   {sku} - {name}")
        inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nDone! Inserted: {inserted} | Skipped (already exist): {skipped}")

if __name__ == "__main__":
    seed()
