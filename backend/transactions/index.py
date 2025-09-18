import json
import os
import psycopg
from datetime import datetime, date
from decimal import Decimal
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user transactions and financial statistics
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name, function_version, memory_limit_in_mb
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Get database connection string
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    # Get user ID from headers
    headers = event.get('headers', {})
    user_id = headers.get('X-User-ID') or headers.get('x-user-id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'User ID required in X-User-ID header'})
        }
    
    try:
        user_id = int(user_id)
    except ValueError:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Invalid user ID'})
        }
    
    try:
        with psycopg.connect(dsn) as conn:
            with conn.cursor() as cur:
                if method == 'GET':
                    return handle_get_transactions(cur, user_id, event.get('queryStringParameters', {}))
                elif method == 'POST':
                    body_data = json.loads(event.get('body', '{}'))
                    return handle_create_transaction(cur, user_id, body_data)
                elif method == 'PUT':
                    body_data = json.loads(event.get('body', '{}'))
                    transaction_id = body_data.get('id')
                    return handle_update_transaction(cur, user_id, transaction_id, body_data)
                elif method == 'DELETE':
                    query_params = event.get('queryStringParameters', {})
                    transaction_id = query_params.get('id')
                    return handle_delete_transaction(cur, user_id, transaction_id)
                else:
                    return {
                        'statusCode': 405,
                        'headers': {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        'body': json.dumps({'error': 'Method not allowed'})
                    }
    
    except psycopg.Error as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }

def decimal_default(obj):
    """JSON serializer for Decimal objects"""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, date):
        return obj.isoformat()
    raise TypeError

def handle_get_transactions(cur, user_id: int, params: Dict[str, Any]) -> Dict[str, Any]:
    """Get transactions for user with optional filtering"""
    action = params.get('action', 'list')
    
    if action == 'stats':
        return get_user_statistics(cur, user_id)
    elif action == 'categories':
        return get_categories_summary(cur, user_id)
    else:
        # Get transactions list
        limit = min(int(params.get('limit', 50)), 100)  # Max 100 transactions
        offset = int(params.get('offset', 0))
        transaction_type = params.get('type')  # 'income' or 'expense'
        category = params.get('category')
        
        query = """
            SELECT id, type, amount, category, description, transaction_date, created_at 
            FROM transactions 
            WHERE user_id = %s
        """
        query_params = [user_id]
        
        if transaction_type:
            query += " AND type = %s"
            query_params.append(transaction_type)
        
        if category:
            query += " AND category = %s"
            query_params.append(category)
        
        query += " ORDER BY transaction_date DESC, created_at DESC LIMIT %s OFFSET %s"
        query_params.extend([limit, offset])
        
        cur.execute(query, query_params)
        transactions = cur.fetchall()
        
        result = []
        for t in transactions:
            result.append({
                'id': t[0],
                'type': t[1],
                'amount': float(t[2]),
                'category': t[3],
                'description': t[4],
                'date': t[5].isoformat(),
                'created_at': t[6].isoformat()
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'transactions': result,
                'total': len(result),
                'limit': limit,
                'offset': offset
            })
        }

def get_user_statistics(cur, user_id: int) -> Dict[str, Any]:
    """Get user financial statistics"""
    # Get income and expense totals
    cur.execute("""
        SELECT 
            type,
            SUM(amount) as total_amount,
            COUNT(*) as transaction_count
        FROM transactions 
        WHERE user_id = %s 
        GROUP BY type
    """, (user_id,))
    
    stats = {'total_income': 0, 'total_expenses': 0, 'income_count': 0, 'expense_count': 0}
    for row in cur.fetchall():
        if row[0] == 'income':
            stats['total_income'] = float(row[1])
            stats['income_count'] = row[2]
        elif row[0] == 'expense':
            stats['total_expenses'] = float(row[1])
            stats['expense_count'] = row[2]
    
    stats['balance'] = stats['total_income'] - stats['total_expenses']
    stats['total_transactions'] = stats['income_count'] + stats['expense_count']
    
    # Get monthly statistics (last 6 months)
    cur.execute("""
        SELECT 
            DATE_TRUNC('month', transaction_date) as month,
            type,
            SUM(amount) as amount
        FROM transactions 
        WHERE user_id = %s 
            AND transaction_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', transaction_date), type
        ORDER BY month DESC
    """, (user_id,))
    
    monthly_stats = {}
    for row in cur.fetchall():
        month_key = row[0].strftime('%Y-%m')
        if month_key not in monthly_stats:
            monthly_stats[month_key] = {'income': 0, 'expenses': 0}
        monthly_stats[month_key][row[1] + 's' if row[1] == 'expense' else row[1]] = float(row[2])
    
    stats['monthly_breakdown'] = monthly_stats
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(stats, default=decimal_default)
    }

def get_categories_summary(cur, user_id: int) -> Dict[str, Any]:
    """Get categories breakdown for user"""
    cur.execute("""
        SELECT 
            type,
            category,
            SUM(amount) as total_amount,
            COUNT(*) as transaction_count
        FROM transactions 
        WHERE user_id = %s 
        GROUP BY type, category
        ORDER BY type, total_amount DESC
    """, (user_id,))
    
    categories = {'income': {}, 'expenses': {}}
    for row in cur.fetchall():
        transaction_type = row[0]
        category = row[1]
        amount = float(row[2])
        count = row[3]
        
        category_key = transaction_type + 's' if transaction_type == 'expense' else transaction_type
        categories[category_key][category] = {
            'amount': amount,
            'count': count
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(categories)
    }

def handle_create_transaction(cur, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create new transaction"""
    transaction_type = data.get('type')
    amount = data.get('amount')
    category = data.get('category', '').strip()
    description = data.get('description', '').strip()
    transaction_date = data.get('date')
    
    # Validation
    if transaction_type not in ['income', 'expense']:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Type must be "income" or "expense"'})
        }
    
    if not amount or float(amount) <= 0:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Amount must be positive'})
        }
    
    if not category or not description:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Category and description are required'})
        }
    
    if not transaction_date:
        transaction_date = date.today().isoformat()
    
    # Insert transaction
    cur.execute("""
        INSERT INTO transactions (user_id, type, amount, category, description, transaction_date)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, created_at
    """, (user_id, transaction_type, amount, category, description, transaction_date))
    
    transaction_id, created_at = cur.fetchone()
    
    return {
        'statusCode': 201,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'success': True,
            'transaction': {
                'id': transaction_id,
                'type': transaction_type,
                'amount': float(amount),
                'category': category,
                'description': description,
                'date': transaction_date,
                'created_at': created_at.isoformat()
            }
        })
    }

def handle_update_transaction(cur, user_id: int, transaction_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update existing transaction"""
    if not transaction_id:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Transaction ID is required'})
        }
    
    # Check if transaction belongs to user
    cur.execute("SELECT id FROM transactions WHERE id = %s AND user_id = %s", (transaction_id, user_id))
    if not cur.fetchone():
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Transaction not found'})
        }
    
    # Build update query dynamically
    updates = []
    params = []
    
    if 'type' in data and data['type'] in ['income', 'expense']:
        updates.append("type = %s")
        params.append(data['type'])
    
    if 'amount' in data and float(data['amount']) > 0:
        updates.append("amount = %s")
        params.append(data['amount'])
    
    if 'category' in data and data['category'].strip():
        updates.append("category = %s")
        params.append(data['category'].strip())
    
    if 'description' in data and data['description'].strip():
        updates.append("description = %s")
        params.append(data['description'].strip())
    
    if 'date' in data:
        updates.append("transaction_date = %s")
        params.append(data['date'])
    
    if not updates:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'No valid fields to update'})
        }
    
    params.extend([transaction_id, user_id])
    
    cur.execute(f"""
        UPDATE transactions 
        SET {', '.join(updates)}
        WHERE id = %s AND user_id = %s
        RETURNING id, type, amount, category, description, transaction_date, created_at
    """, params)
    
    updated_transaction = cur.fetchone()
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'success': True,
            'transaction': {
                'id': updated_transaction[0],
                'type': updated_transaction[1],
                'amount': float(updated_transaction[2]),
                'category': updated_transaction[3],
                'description': updated_transaction[4],
                'date': updated_transaction[5].isoformat(),
                'created_at': updated_transaction[6].isoformat()
            }
        })
    }

def handle_delete_transaction(cur, user_id: int, transaction_id: str) -> Dict[str, Any]:
    """Delete transaction"""
    if not transaction_id:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Transaction ID is required'})
        }
    
    try:
        transaction_id = int(transaction_id)
    except ValueError:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Invalid transaction ID'})
        }
    
    # Delete transaction
    cur.execute("DELETE FROM transactions WHERE id = %s AND user_id = %s", (transaction_id, user_id))
    
    if cur.rowcount == 0:
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Transaction not found'})
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'success': True, 'message': 'Transaction deleted'})
    }