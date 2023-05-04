namespace FoldableFieldseT {
    export type Props = Readonly<{
        legend: string,
        id?: string,
        children: React.ReactNode[]
    }>;
    
    export type State = Readonly<{
        unfolded: boolean
    }>;
}

export default FoldableFieldseT;