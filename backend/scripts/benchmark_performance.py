import psycopg2
import time
import json

DATABASE_URL = "postgresql://postgres:password@localhost:5433/businesshub"

# Queries to evaluate
QUERIES = {
    "1. SKU Exact Match (B-Tree Target)": 
        "SELECT * FROM products WHERE sku = 'SKU-12345678' LIMIT 1;",
    
    "2. Wildcard Product Search (GIN Target vs LIKE)": 
        "SELECT * FROM products WHERE name ILIKE '%electronics%';",
        
    "3. Customer Invoice History (Composite Index Target)": 
        "SELECT invoice_number, invoice_date, total_amount FROM invoices WHERE customer_name = 'John Doe' ORDER BY invoice_date DESC LIMIT 50;",
        
    "4. Monthly Revenue Aggregation (Date Index Target)": 
        "SELECT SUM(total_amount) FROM invoices WHERE invoice_date >= NOW() - INTERVAL '30 days';"
}

def get_explain_analyze(cursor, query):
    cursor.execute(f"EXPLAIN ANALYZE {query}")
    explain_output = cursor.fetchall()
    
    # Parse execution time from the last few lines of EXPLAIN ANALYZE
    # Typically looks like: Execution Time: 15.244 ms
    execution_time_ms = 0.0
    for row in explain_output:
        line = row[0]
        if "Execution Time" in line:
            execution_time_ms = float(line.split(":")[1].strip().replace(" ms", ""))
            break
            
    return execution_time_ms

def run_benchmarks():
    print("="*60)
    print("🚀  BUSINESS_HUB ERP PERFORMANCE BENCHMARK  🚀")
    print("="*60)
    print("Running EXPLAIN ANALYZE on typical queries...")
    print("-" * 60)
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        results = {}
        
        for name, query in QUERIES.items():
            print(f"Benchmarking: {name}")
            # Run a few times to warm cache and take average
            times = []
            for _ in range(3):
                times.append(get_explain_analyze(cursor, query))
                
            avg_time = sum(times) / len(times)
            results[name] = {"avg_time_ms": round(avg_time, 3)}
            print(f"  --> Average Execution Time: {avg_time:.3f} ms\n")
            
        cursor.close()
        conn.close()
        
        # Save to file
        with open("benchmark_results.json", "w") as f:
            json.dump(results, f, indent=4)
            
        print("Done! Results saved to benchmark_results.json.")
        
    except psycopg2.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_benchmarks()
