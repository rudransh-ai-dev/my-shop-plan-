"""add_performance_indexes

Revision ID: 4f1471bb7e2a
Revises: 14df55a802d8
Create Date: 2026-03-22 07:15:47.063005

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4f1471bb7e2a'
down_revision: Union[str, Sequence[str], None] = '14df55a802d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    op.execute("CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin (name gin_trgm_ops);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_invoices_customer_date ON invoices (customer_name, invoice_date);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_products_sku_performance ON products(sku);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_invoices_date_performance ON invoices(invoice_date);")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX IF EXISTS ix_invoices_date_performance;")
    op.execute("DROP INDEX IF EXISTS ix_products_sku_performance;")
    op.execute("DROP INDEX IF EXISTS idx_invoices_customer_date;")
    op.execute("DROP INDEX IF EXISTS idx_products_name_gin;")
    # Dropping extension could be dangerous if other DBs use it, but safe for this project
    op.execute("DROP EXTENSION IF EXISTS pg_trgm;")
