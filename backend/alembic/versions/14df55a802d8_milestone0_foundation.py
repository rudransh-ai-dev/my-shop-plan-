"""milestone0 foundation

Revision ID: 14df55a802d8
Revises: 
Create Date: 2026-03-17 22:58:40.686027

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '14df55a802d8'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # --- Soft delete columns on all business tables ---
    for table in [
        "companies",
        "users",
        "products",
        "invoices",
        "invoice_items",
        "stock_movements",
        "audit_logs",
    ]:
        op.add_column(table, sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false"), nullable=False))
        op.add_column(table, sa.Column("deleted_at", sa.DateTime(), nullable=True))
        op.create_index(op.f(f"ix_{table}_is_deleted"), table, ["is_deleted"], unique=False)

    # --- Decimal-safe money fields (PostgreSQL) ---
    # products.purchase_price, products.selling_price, products.gst_rate
    op.alter_column(
        "products",
        "purchase_price",
        existing_type=sa.Float(),
        type_=sa.Numeric(12, 2),
        postgresql_using="purchase_price::numeric",
    )
    op.alter_column(
        "products",
        "selling_price",
        existing_type=sa.Float(),
        type_=sa.Numeric(12, 2),
        postgresql_using="selling_price::numeric",
    )
    op.alter_column(
        "products",
        "gst_rate",
        existing_type=sa.Float(),
        type_=sa.Numeric(5, 2),
        postgresql_using="gst_rate::numeric",
    )

    # invoices.total_amount
    op.alter_column(
        "invoices",
        "total_amount",
        existing_type=sa.Float(),
        type_=sa.Numeric(12, 2),
        postgresql_using="total_amount::numeric",
    )

    # invoice_items.unit_price, cgst, sgst, igst, total
    op.alter_column(
        "invoice_items",
        "unit_price",
        existing_type=sa.Float(),
        type_=sa.Numeric(12, 2),
        postgresql_using="unit_price::numeric",
    )
    op.alter_column(
        "invoice_items",
        "cgst",
        existing_type=sa.Float(),
        type_=sa.Numeric(12, 2),
        postgresql_using="cgst::numeric",
    )
    op.alter_column(
        "invoice_items",
        "sgst",
        existing_type=sa.Float(),
        type_=sa.Numeric(12, 2),
        postgresql_using="sgst::numeric",
    )
    op.alter_column(
        "invoice_items",
        "igst",
        existing_type=sa.Float(),
        type_=sa.Numeric(12, 2),
        postgresql_using="igst::numeric",
    )
    op.alter_column(
        "invoice_items",
        "total",
        existing_type=sa.Float(),
        type_=sa.Numeric(12, 2),
        postgresql_using="total::numeric",
    )

    # --- Idempotency keys table ---
    op.create_table(
        "idempotency_keys",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("companies.id"), nullable=False, index=True),
        sa.Column("key", sa.String(), nullable=False),
        sa.Column("endpoint", sa.String(), nullable=False),
        sa.Column("request_hash", sa.String(), nullable=True),
        sa.Column("response_status", sa.Integer(), nullable=True),
        sa.Column("response_body", sa.Text(), nullable=True),
    )
    op.create_index("ix_idempotency_keys_company_endpoint_key", "idempotency_keys", ["company_id", "endpoint", "key"], unique=True)
    op.create_index(op.f("ix_idempotency_keys_is_deleted"), "idempotency_keys", ["is_deleted"], unique=False)

    # --- Constraints / indexes ---
    op.create_unique_constraint("uq_products_company_sku", "products", ["company_id", "sku"])
    op.create_unique_constraint("uq_invoices_company_invoice_number", "invoices", ["company_id", "invoice_number"])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop constraints
    op.drop_constraint("uq_invoices_company_invoice_number", "invoices", type_="unique")
    op.drop_constraint("uq_products_company_sku", "products", type_="unique")

    # Drop idempotency table
    op.drop_index("ix_idempotency_keys_company_endpoint_key", table_name="idempotency_keys")
    op.drop_index(op.f("ix_idempotency_keys_is_deleted"), table_name="idempotency_keys")
    op.drop_table("idempotency_keys")

    # Revert money fields
    op.alter_column("invoice_items", "total", existing_type=sa.Numeric(12, 2), type_=sa.Float(), postgresql_using="total::double precision")
    op.alter_column("invoice_items", "igst", existing_type=sa.Numeric(12, 2), type_=sa.Float(), postgresql_using="igst::double precision")
    op.alter_column("invoice_items", "sgst", existing_type=sa.Numeric(12, 2), type_=sa.Float(), postgresql_using="sgst::double precision")
    op.alter_column("invoice_items", "cgst", existing_type=sa.Numeric(12, 2), type_=sa.Float(), postgresql_using="cgst::double precision")
    op.alter_column("invoice_items", "unit_price", existing_type=sa.Numeric(12, 2), type_=sa.Float(), postgresql_using="unit_price::double precision")
    op.alter_column("invoices", "total_amount", existing_type=sa.Numeric(12, 2), type_=sa.Float(), postgresql_using="total_amount::double precision")
    op.alter_column("products", "gst_rate", existing_type=sa.Numeric(5, 2), type_=sa.Float(), postgresql_using="gst_rate::double precision")
    op.alter_column("products", "selling_price", existing_type=sa.Numeric(12, 2), type_=sa.Float(), postgresql_using="selling_price::double precision")
    op.alter_column("products", "purchase_price", existing_type=sa.Numeric(12, 2), type_=sa.Float(), postgresql_using="purchase_price::double precision")

    # Drop soft-delete columns
    for table in [
        "audit_logs",
        "stock_movements",
        "invoice_items",
        "invoices",
        "products",
        "users",
        "companies",
    ]:
        op.drop_index(op.f(f"ix_{table}_is_deleted"), table_name=table)
        op.drop_column(table, "deleted_at")
        op.drop_column(table, "is_deleted")
